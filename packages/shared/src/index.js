// Main export file for shared package

// Supabase client
export { supabase, isAuthenticated, getCurrentUser } from './lib/supabase.js';

// Services
export { authService } from './services/authService.js';
export { projectService } from './services/projectService.js';
export { promptService } from './services/promptService.js';
export { shareService } from './services/shareService.js';
export { settingsService } from './services/settingsService.js';
export { syncService } from './services/syncService.js';

// Utilities
export { markdownUtils } from './utils/markdown.js';
export {
  getUserFriendlyError,
  getErrorCode,
  isNetworkError,
  isAuthError,
  requiresReauth,
  logError
} from './utils/errorHandler.js';

// Import for default export
import { authService } from './services/authService.js';
import { projectService } from './services/projectService.js';
import { promptService } from './services/promptService.js';
import { shareService } from './services/shareService.js';
import { settingsService } from './services/settingsService.js';
import { syncService } from './services/syncService.js';

// Re-export commonly used functions
export const services = {
  auth: authService,
  projects: projectService,
  prompts: promptService,
  share: shareService,
  settings: settingsService,
  sync: syncService,
};

export default services;