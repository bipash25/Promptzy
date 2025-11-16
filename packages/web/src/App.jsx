import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from '@promptzy/shared';
import { useStore } from './store/useStore';

// Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import SettingsPage from './pages/SettingsPage';
import SharedPromptPage from './pages/SharedPromptPage';
import SharedProjectPage from './pages/SharedProjectPage';

// Components
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, setSession, loadSettings } = useStore();

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        
        if (session) {
          setSession(session);
          const user = await authService.getUser();
          setUser(user);
          await loadSettings();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to auth changes
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        const user = await authService.getUser();
        setUser(user);
        await loadSettings();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [setUser, setSession, loadSettings]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/" />} />
      <Route path="/shared/prompt/:token" element={<SharedPromptPage />} />
      <Route path="/shared/project/:token" element={<SharedProjectPage />} />

      {/* Protected routes */}
      <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/editor/:id" element={user ? <EditorPage /> : <Navigate to="/login" />} />
      <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;