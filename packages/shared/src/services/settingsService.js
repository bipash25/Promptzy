import { supabase } from '../lib/supabase';

// Helper to ensure user is authenticated
async function requireAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Authentication required. Please log in.');
  }
  return user;
}

export const settingsService = {
  // Get user settings
  async get() {
    const user = await requireAuth();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Create default settings if they don't exist
      if (error.code === 'PGRST116') {
        return this.create();
      }
      throw error;
    }

    return data;
  },

  // Create default settings
  async create() {
    const user = await requireAuth();
    
    const defaultSettings = {
      user_id: user.id,
      theme: 'light',
      font_family: 'Inter',
      font_size: 14,
      layout_mode: 'comfortable',
      auto_backup: true,
      sync_enabled: true,
      encryption_enabled: false,
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update settings
  async update(updates) {
    const user = await requireAuth();
    
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No settings to update');
    }
    
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update theme
  async updateTheme(theme) {
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(theme)) {
      throw new Error(`Invalid theme. Must be one of: ${validThemes.join(', ')}`);
    }
    return this.update({ theme });
  },

  // Update font settings
  async updateFont(fontFamily, fontSize) {
    if (fontSize && (fontSize < 8 || fontSize > 32)) {
      throw new Error('Font size must be between 8 and 32');
    }
    
    const updates = {};
    if (fontFamily) updates.font_family = fontFamily;
    if (fontSize) updates.font_size = fontSize;
    
    if (Object.keys(updates).length === 0) {
      throw new Error('Font family or font size is required');
    }
    
    return this.update(updates);
  },

  // Update layout mode
  async updateLayout(mode) {
    const validModes = ['comfortable', 'compact'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid layout mode. Must be one of: ${validModes.join(', ')}`);
    }
    return this.update({ layout_mode: mode });
  },

  // Toggle sync
  async toggleSync(enabled) {
    if (typeof enabled !== 'boolean') {
      throw new Error('Enabled must be a boolean value');
    }
    return this.update({ sync_enabled: enabled });
  },

  // Toggle auto backup
  async toggleAutoBackup(enabled) {
    if (typeof enabled !== 'boolean') {
      throw new Error('Enabled must be a boolean value');
    }
    return this.update({ auto_backup: enabled });
  },

  // Toggle encryption
  async toggleEncryption(enabled) {
    if (typeof enabled !== 'boolean') {
      throw new Error('Enabled must be a boolean value');
    }
    return this.update({ encryption_enabled: enabled });
  },

  // Export all user data
  async exportAllData() {
    const user = await requireAuth();
    
    // Get all data
    const [projects, prompts, settings] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('prompts').select('*').eq('user_id', user.id),
      this.get(),
    ]);

    const backup = {
      user: {
        id: user.id,
        email: user.email,
      },
      settings: settings,
      projects: projects.data,
      prompts: prompts.data,
      exported_at: new Date().toISOString(),
      version: '1.0.0',
    };

    return backup;
  },

  // Import user data
  async importData(backupData) {
    const user = await requireAuth();
    
    if (!backupData) {
      throw new Error('Backup data is required');
    }
    
    // Validate backup format
    if (!backupData.version || !backupData.projects || !backupData.prompts) {
      throw new Error('Invalid backup format');
    }

    // Import projects
    const projectIdMap = new Map();
    for (const project of backupData.projects) {
      const { id: oldId, ...projectData } = project;
      const { data: newProject } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();
      
      projectIdMap.set(oldId, newProject.id);
    }

    // Import prompts
    for (const prompt of backupData.prompts) {
      const { id, ...promptData } = prompt;
      await supabase
        .from('prompts')
        .insert({
          ...promptData,
          user_id: user.id,
          project_id: projectIdMap.get(prompt.project_id) || null,
        });
    }

    // Update settings
    if (backupData.settings) {
      const { user_id, created_at, updated_at, ...settingsData } = backupData.settings;
      await this.update(settingsData);
    }

    return true;
  },
};

export default settingsService;