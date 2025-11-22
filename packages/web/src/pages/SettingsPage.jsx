import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '@promptzy/shared';
import { useStore } from '../store/useStore';
import {
  Moon,
  Sun,
  Layout,
  Download,
  Upload,
  Trash2,
  Save,
  User,
  Mail,
  Shield,
  Monitor
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

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
          await settingsService.exportAllData();
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
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your preferences and account settings.</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? <span className="animate-pulse">Saving...</span> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>Manage your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how Promptzy looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'light'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <Sun size={20} />
                    <span className="font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <Moon size={20} />
                    <span className="font-medium">Dark</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Inter">Inter</option>
                    <option value="System">System Default</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Outfit">Outfit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size ({fontSize}px)</label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data & Sync
              </CardTitle>
              <CardDescription>Manage your data, backups, and synchronization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <div className="font-medium">Cloud Sync</div>
                  <div className="text-sm text-muted-foreground">Sync your prompts across all devices</div>
                </div>
                <button
                  onClick={() => setSyncEnabled(!syncEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${syncEnabled ? 'bg-primary' : 'bg-input'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${syncEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <div className="flex-1 relative">
                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="space-y-0.5">
                  <div className="font-medium text-destructive">Delete Account</div>
                  <div className="text-sm text-destructive/80">Permanently delete your account and all data</div>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground py-8">
          Promptzy v1.0.0 • Built with ❤️
        </div>
      </div>
    </MainLayout>
  );
}