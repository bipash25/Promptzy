import { supabase } from '../lib/supabase';

export const syncService = {
  // Add operation to sync queue
  async queueOperation(operation, tableName, recordId, data) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: queued, error } = await supabase
      .from('sync_queue')
      .insert({
        user_id: user.id,
        operation,
        table_name: tableName,
        record_id: recordId,
        data,
        synced: false,
      })
      .select()
      .single();

    if (error) throw error;
    return queued;
  },

  // Get pending sync operations
  async getPendingOperations() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('sync_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('synced', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Process sync queue
  async processSyncQueue() {
    const operations = await this.getPendingOperations();
    const results = [];

    for (const op of operations) {
      try {
        let result;

        switch (op.operation) {
          case 'create':
            result = await this.executeCreate(op.table_name, op.data);
            break;
          case 'update':
            result = await this.executeUpdate(op.table_name, op.record_id, op.data);
            break;
          case 'delete':
            result = await this.executeDelete(op.table_name, op.record_id);
            break;
          default:
            throw new Error(`Unknown operation: ${op.operation}`);
        }

        // Mark as synced
        await supabase
          .from('sync_queue')
          .update({ synced: true })
          .eq('id', op.id);

        results.push({ success: true, operation: op });
      } catch (error) {
        results.push({ success: false, operation: op, error: error.message });
      }
    }

    return results;
  },

  // Execute create operation
  async executeCreate(tableName, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Execute update operation
  async executeUpdate(tableName, recordId, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Execute delete operation
  async executeDelete(tableName, recordId) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', recordId);

    if (error) throw error;
  },

  // Clear synced operations
  async clearSyncedOperations() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('sync_queue')
      .delete()
      .eq('user_id', user.id)
      .eq('synced', true);

    if (error) throw error;
  },

  // Check if online
  isOnline() {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Assume online if navigator not available
  },

  // Set up online/offline listeners
  setupOnlineListener(onOnline, onOffline) {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        onOnline && onOnline();
        // Auto-sync when coming back online
        await this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        onOffline && onOffline();
      });
    }
  },

  // Handle conflict resolution
  async resolveConflict(localData, remoteData, strategy = 'last_write_wins') {
    switch (strategy) {
      case 'last_write_wins':
        return new Date(localData.updated_at) > new Date(remoteData.updated_at)
          ? localData
          : remoteData;

      case 'keep_local':
        return localData;

      case 'keep_remote':
        return remoteData;

      case 'merge':
        // Merge strategy - combine non-conflicting fields
        return {
          ...remoteData,
          ...localData,
          updated_at: new Date().toISOString(),
        };

      default:
        return remoteData;
    }
  },

  // Get sync status
  async getSyncStatus() {
    const pending = await this.getPendingOperations();
    
    return {
      online: this.isOnline(),
      pendingCount: pending.length,
      lastSync: await this.getLastSyncTime(),
    };
  },

  // Get last sync time
  async getLastSyncTime() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('sync_queue')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('synced', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.created_at;
  },

  // Force sync all data
  async forceSyncAll() {
    if (!this.isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    const results = await this.processSyncQueue();
    await this.clearSyncedOperations();
    
    return results;
  },
};

export default syncService;