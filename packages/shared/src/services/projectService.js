import { supabase } from '../lib/supabase';

export const projectService = {
  // Get all projects for current user
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get single project
  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get project hierarchy (nested projects)
  async getHierarchy() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Build tree structure
    const projectMap = new Map();
    const roots = [];

    data.forEach(project => {
      projectMap.set(project.id, { ...project, children: [] });
    });

    data.forEach(project => {
      const node = projectMap.get(project.id);
      if (project.parent_id) {
        const parent = projectMap.get(project.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  },

  // Create new project
  async create(project) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update project
  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete project (and all its prompts)
  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Archive project
  async archive(id) {
    return this.update(id, { is_archived: true });
  },

  // Unarchive project
  async unarchive(id) {
    return this.update(id, { is_archived: false });
  },

  // Get archived projects
  async getArchived() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Move project to different parent
  async move(id, newParentId) {
    return this.update(id, { parent_id: newParentId });
  },

  // Check for duplicate project names
  async checkDuplicate(name, parentId = null) {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name);

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0;
  },
};

export default projectService;