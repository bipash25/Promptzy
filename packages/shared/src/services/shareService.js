import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';

export const shareService = {
  // Create shareable link for prompt
  async sharePrompt(promptId, options = {}) {
    const shareToken = nanoid(16);
    
    const { data, error } = await supabase
      .from('shared_prompts')
      .insert({
        prompt_id: promptId,
        share_token: shareToken,
        password_hash: options.password ? await this.hashPassword(options.password) : null,
        expires_at: options.expiresAt || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      url: `${window.location.origin}/shared/prompt/${shareToken}`,
    };
  },

  // Create shareable link for project
  async shareProject(projectId, options = {}) {
    const shareToken = nanoid(16);
    
    const { data, error } = await supabase
      .from('shared_projects')
      .insert({
        project_id: projectId,
        share_token: shareToken,
        password_hash: options.password ? await this.hashPassword(options.password) : null,
        expires_at: options.expiresAt || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      url: `${window.location.origin}/shared/project/${shareToken}`,
    };
  },

  // Get shared prompt by token
  async getSharedPrompt(token, password = null) {
    const { data: share, error: shareError } = await supabase
      .from('shared_prompts')
      .select('*, prompts(*)')
      .eq('share_token', token)
      .single();

    if (shareError) throw new Error('Invalid or expired share link');

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw new Error('This share link has expired');
    }

    // Check password
    if (share.password_hash && password) {
      const isValid = await this.verifyPassword(password, share.password_hash);
      if (!isValid) throw new Error('Incorrect password');
    }

    // Increment view count
    await supabase
      .from('shared_prompts')
      .update({ view_count: share.view_count + 1 })
      .eq('id', share.id);

    return share.prompts;
  },

  // Get shared project by token
  async getSharedProject(token, password = null) {
    const { data: share, error: shareError } = await supabase
      .from('shared_projects')
      .select('*, projects(*)')
      .eq('share_token', token)
      .single();

    if (shareError) throw new Error('Invalid or expired share link');

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw new Error('This share link has expired');
    }

    // Check password
    if (share.password_hash && password) {
      const isValid = await this.verifyPassword(password, share.password_hash);
      if (!isValid) throw new Error('Incorrect password');
    }

    // Get all prompts in project
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('*')
      .eq('project_id', share.project_id)
      .eq('is_archived', false);

    if (promptsError) throw promptsError;

    // Increment view count
    await supabase
      .from('shared_projects')
      .update({ view_count: share.view_count + 1 })
      .eq('id', share.id);

    return {
      project: share.projects,
      prompts,
    };
  },

  // Delete share link
  async deleteShare(shareId, type = 'prompt') {
    const table = type === 'prompt' ? 'shared_prompts' : 'shared_projects';
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', shareId);

    if (error) throw error;
  },

  // Export prompt as JSON
  exportAsJSON(prompt) {
    const data = {
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags,
      created_at: prompt.created_at,
      updated_at: prompt.updated_at,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return blob;
  },

  // Export prompt as Markdown
  exportAsMarkdown(prompt) {
    let markdown = `# ${prompt.title}\n\n`;
    
    if (prompt.tags && prompt.tags.length > 0) {
      markdown += `**Tags:** ${prompt.tags.join(', ')}\n\n`;
    }
    
    markdown += `---\n\n${prompt.content}\n\n`;
    markdown += `---\n\n`;
    markdown += `*Created: ${new Date(prompt.created_at).toLocaleDateString()}*\n`;
    markdown += `*Updated: ${new Date(prompt.updated_at).toLocaleDateString()}*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    return blob;
  },

  // Export prompt as plain text
  exportAsText(prompt) {
    let text = `${prompt.title}\n\n`;
    text += `${prompt.content}\n\n`;
    text += `Tags: ${prompt.tags ? prompt.tags.join(', ') : 'None'}\n`;
    text += `Created: ${new Date(prompt.created_at).toLocaleDateString()}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    return blob;
  },

  // Export project with all prompts
  exportProject(project, prompts) {
    const data = {
      project: {
        name: project.name,
        color: project.color,
        created_at: project.created_at,
      },
      prompts: prompts.map(p => ({
        title: p.title,
        content: p.content,
        tags: p.tags,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return blob;
  },

  // Import prompts from JSON
  async importFromJSON(jsonData, projectId = null) {
    const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Handle different import formats
    if (parsed.prompts && Array.isArray(parsed.prompts)) {
      // Project export format
      const imported = [];
      for (const prompt of parsed.prompts) {
        const { promptService } = await import('./promptService');
        const created = await promptService.create({
          ...prompt,
          project_id: projectId,
        });
        imported.push(created);
      }
      return imported;
    } else if (parsed.title && parsed.content) {
      // Single prompt format
      const { promptService } = await import('./promptService');
      return [await promptService.create({
        ...parsed,
        project_id: projectId,
      })];
    }

    throw new Error('Invalid import format');
  },

  // Generate QR code data URL
  async generateQRCode(url) {
    // Using a QR code API or library
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    return qrApiUrl;
  },

  // Simple password hashing (use bcrypt in production)
  async hashPassword(password) {
    // In real implementation, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // Verify password
  async verifyPassword(password, hash) {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  },
};

export default shareService;