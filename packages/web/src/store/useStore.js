import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, projectService, promptService, settingsService } from '@promptzy/shared';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      session: null,

      // Data state
      projects: [],
      prompts: [],
      settings: null,

      // UI state
      selectedProject: null,
      selectedPrompt: null,
      isEditing: false,
      showSidebar: true,
      syncStatus: { online: true, pendingCount: 0 },

      // Auth actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),

      signOut: async () => {
        await authService.signOut();
        set({ user: null, session: null, projects: [], prompts: [] });
      },

      // Data actions
      loadProjects: async () => {
        try {
          const projects = await projectService.getHierarchy();
          set({ projects });
        } catch (error) {
          console.error('Failed to load projects:', error);
          set({ projects: [] });
        }
      },

      loadPrompts: async (filters) => {
        try {
          const prompts = await promptService.getAll(filters);
          set({ prompts });
        } catch (error) {
          console.error('Failed to load prompts:', error);
          set({ prompts: [] });
        }
      },

      loadSettings: async () => {
        try {
          const settings = await settingsService.get();
          set({ settings });
        } catch (error) {
          console.error('Failed to load settings:', error);
          // Use default settings
          set({ settings: { theme: 'light', font_family: 'Inter', font_size: 14 } });
        }
      },

      // UI actions
      selectProject: (projectId) => set({ selectedProject: projectId }),
      selectPrompt: (promptId) => set({ selectedPrompt: promptId }),
      setEditing: (isEditing) => set({ isEditing }),
      toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),

      updateSyncStatus: (status) => set({ syncStatus: status }),
    }),
    {
      name: 'promptzy-store',
      partialize: (state) => ({
        showSidebar: state.showSidebar,
        selectedProject: state.selectedProject,
      }),
    }
  )
);