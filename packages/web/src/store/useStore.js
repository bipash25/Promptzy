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
        const projects = await projectService.getHierarchy();
        set({ projects });
      },
      
      loadPrompts: async (filters) => {
        const prompts = await promptService.getAll(filters);
        set({ prompts });
      },
      
      loadSettings: async () => {
        const settings = await settingsService.get();
        set({ settings });
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