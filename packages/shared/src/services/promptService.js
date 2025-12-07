import { supabase } from '../lib/supabase';

// Helper to ensure user is authenticated
async function requireAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Authentication required. Please log in.');
  }
  return user;
}

export const promptService = {
  // Get all prompts for current user
  async getAll(filters = {}) {
    await requireAuth();
    
    let query = supabase
      .from('prompts')
      .select('*, projects(name, color)')
      .eq('is_archived', false);

    // Apply filters
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    if (filters.favorite) {
      query = query.eq('favorite', true);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Sorting
    const sortBy = filters.sortBy || 'updated_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Get single prompt with full details
  async getById(id) {
    await requireAuth();
    
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        projects(name, color),
        prompt_notes(*),
        prompt_links!prompt_links_source_prompt_id_fkey(
          id,
          target_prompt_id,
          order_index,
          target:prompts!prompt_links_target_prompt_id_fkey(id, title)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get prompt versions/history
  async getVersions(promptId) {
    await requireAuth();
    
    if (!promptId) {
      throw new Error('Prompt ID is required');
    }
    
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create new prompt
  async create(prompt) {
    const user = await requireAuth();
    
    if (!prompt) {
      throw new Error('Prompt data is required');
    }
    
    if (!prompt.title || prompt.title.trim() === '') {
      throw new Error('Prompt title is required');
    }
    
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        ...prompt,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update prompt
  async update(id, updates) {
    await requireAuth();
    
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    
    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete prompt
  async delete(id) {
    await requireAuth();
    
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Toggle favorite
  async toggleFavorite(id, currentValue) {
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    return this.update(id, { favorite: !currentValue });
  },

  // Archive prompt
  async archive(id) {
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    return this.update(id, { is_archived: true });
  },

  // Increment usage count
  async incrementUsage(id) {
    await requireAuth();
    
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    
    const { data, error } = await supabase.rpc('increment_usage', {
      prompt_id: id,
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const prompt = await this.getById(id);
      return this.update(id, { 
        usage_count: prompt.usage_count + 1,
        last_used_at: new Date().toISOString(),
      });
    }
    return data;
  },

  // Get favorites
  async getFavorites() {
    return this.getAll({ favorite: true });
  },

  // Get archived prompts
  async getArchived() {
    await requireAuth();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*, projects(name, color)')
      .eq('is_archived', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Check for duplicate content
  async checkDuplicate(content, excludeId = null) {
    const user = await requireAuth();
    
    if (!content || content.trim() === '') {
      return [];
    }
    
    let query = supabase
      .from('prompts')
      .select('id, title')
      .eq('user_id', user.id)
      .eq('content', content);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Add note to prompt
  async addNote(promptId, content) {
    await requireAuth();
    
    if (!promptId) {
      throw new Error('Prompt ID is required');
    }
    
    if (!content || content.trim() === '') {
      throw new Error('Note content is required');
    }
    
    const { data, error } = await supabase
      .from('prompt_notes')
      .insert({
        prompt_id: promptId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update note
  async updateNote(noteId, content) {
    await requireAuth();
    
    if (!noteId) {
      throw new Error('Note ID is required');
    }
    
    const { data, error } = await supabase
      .from('prompt_notes')
      .update({ content })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete note
  async deleteNote(noteId) {
    await requireAuth();
    
    if (!noteId) {
      throw new Error('Note ID is required');
    }
    
    const { error } = await supabase
      .from('prompt_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  },

  // Create prompt link (chaining)
  async linkPrompts(sourceId, targetId, orderIndex = 0) {
    const user = await requireAuth();
    
    if (!sourceId || !targetId) {
      throw new Error('Both source and target prompt IDs are required');
    }
    
    if (sourceId === targetId) {
      throw new Error('Cannot link a prompt to itself');
    }
    
    const { data, error } = await supabase
      .from('prompt_links')
      .insert({
        user_id: user.id,
        source_prompt_id: sourceId,
        target_prompt_id: targetId,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove prompt link
  async unlinkPrompts(sourceId, targetId) {
    await requireAuth();
    
    if (!sourceId || !targetId) {
      throw new Error('Both source and target prompt IDs are required');
    }
    
    const { error } = await supabase
      .from('prompt_links')
      .delete()
      .eq('source_prompt_id', sourceId)
      .eq('target_prompt_id', targetId);

    if (error) throw error;
  },

  // Get all unique tags
  async getAllTags() {
    const user = await requireAuth();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('tags')
      .eq('user_id', user.id);

    if (error) throw error;

    // Extract unique tags
    const tagsSet = new Set();
    data.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tag => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  },

  // Revert to specific version
  async revertToVersion(promptId, versionNumber) {
    await requireAuth();
    
    if (!promptId) {
      throw new Error('Prompt ID is required');
    }
    
    if (versionNumber === undefined || versionNumber === null) {
      throw new Error('Version number is required');
    }
    
    const { data: version, error: versionError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('version_number', versionNumber)
      .single();

    if (versionError) throw versionError;

    return this.update(promptId, {
      title: version.title,
      content: version.content,
    });
  },
};

export default promptService;