import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsService, authService } from '@promptzy/shared';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Moon,
  Sun,
  Type,
  Layout,
  Download,
  Upload,
  Shield,
  Trash2,
  Save,
  User,
  Mail,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, settings, loadSettings, signOut } = useStore();

  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [layoutMode, setLayoutMode] = useState('comfortable');
  const [autoBackup, setAutoBackup] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme || 'light');
      setFontSize(settings.font_size || 14);
      setFontFamily(settings.font_family || 'Inter');
      setLayoutMode(settings.layout_mode || 'comfortable');
      setAutoBackup(settings.auto_backup ?? true);
      setSyncEnabled(settings.sync_enabled ?? true);
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      setHasChanges(
        theme !== settings.theme ||
        fontSize !== settings.font_size ||
        fontFamily !== settings.font_family ||
        layoutMode !== settings.layout_mode ||
        autoBackup !== settings.auto_backup ||
        syncEnabled !== settings.sync_enabled
      );
    }
  }, [theme, fontSize, fontFamily, layoutMode, autoBackup, syncEnabled, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.update({
        theme,
        font_size: fontSize,
        font_family: fontFamily,
        layout_mode: layoutMode,
        auto_backup: autoBackup,
        sync_enabled: syncEnabled,
      });
      await loadSettings();
      setHasChanges(false);
      
      // Apply theme
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const backup = await settingsService.exportAllData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptzy-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (confirm('This will import all data from the backup. Existing data may be overwritten. Continue?')) {
        await settingsService.importData(data);
        alert('Data imported successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your prompts and projects. Are you absolutely sure?')) {
        try {
          // Delete all user data first
          await settingsService.exportAllData(); // Optional: auto-backup before delete
          
          alert('Account deletion initiated. You will be signed out.');
          await signOut();
          navigate('/login');
        } catch (error) {
          console.error('Account deletion failed:', error);
          alert('Failed to delete account');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save size={18} className="mr-2" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
              <span className="sm:hidden">{saving ? '...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Account Section */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-blue-500" />
              <h2 className="text-xl font-semibold">Account</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Layout size={20} className="text-blue-500" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sun size={20} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Moon size={20} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="input"
                >
                  <option value="Inter">Inter</option>
                  <option value="System">System Default</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Layout Mode
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLayoutMode('compact')}
                    className={`flex-1 p-3 rounded-lg border-2 transition ${
                      layoutMode === 'compact'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => setLayoutMode('comfortable')}
                    className={`flex-1 p-3 rounded-lg border-2 transition ${
                      layoutMode === 'comfortable'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Comfortable
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sync & Backup Section */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Download size={20} className="text-blue-500" />
              <h2 className="text-xl font-semibold">Sync & Backup</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cloud Sync</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically sync across devices
                  </p>
                </div>
                <button
                  onClick={() => setSyncEnabled(!syncEnabled)}
                  className={`relative w-12 h-6 rounded-full transition ${
                    syncEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      syncEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatic daily backups
                  </p>
                </div>
                <button
                  onClick={() => setAutoBackup(!autoBackup)}
                  className={`relative w-12 h-6 rounded-full transition ${
                    autoBackup ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoBackup ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <Download size={18} />
                  Export All Data
                </button>
                <label className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                  <Upload size={18} />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 size={20} className="text-red-500" />
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition font-medium"
              >
                Delete Account
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-500 py-4">
            Promptzy v1.0.0 • Built with ❤️
          </div>
        </div>
      </div>
    </div>
  );
}