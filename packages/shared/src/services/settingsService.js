import { supabase } from '../lib/supabase';

export const settingsService = {
  // Get user settings
  async get() {
    const { data: { user } } = await supabase.auth.getUser();
    
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
    const { data: { user } } = await supabase.auth.getUser();
    
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
    const { data: { user } } = await supabase.auth.getUser();
    
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
    return this.update({ theme });
  },

  // Update font settings
  async updateFont(fontFamily, fontSize) {
    return this.update({ 
      font_family: fontFamily, 
      font_size: fontSize 
    });
  },

  // Update layout mode
  async updateLayout(mode) {
    return this.update({ layout_mode: mode });
  },

  // Toggle sync
  async toggleSync(enabled) {
    return this.update({ sync_enabled: enabled });
  },

  // Toggle auto backup
  async toggleAutoBackup(enabled) {
    return this.update({ auto_backup: enabled });
  },

  // Toggle encryption
  async toggleEncryption(enabled) {
    return this.update({ encryption_enabled: enabled });
  },

  // Export all user data
  async exportAllData() {
    const { data: { user } } = await supabase.auth.getUser();
    
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
    const { data: { user } } = await supabase.auth.getUser();
    
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