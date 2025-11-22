import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from '@promptzy/shared';
import { useStore } from './store/useStore';
import { AnimatePresence, motion } from 'framer-motion';

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

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, setSession, loadSettings } = useStore();
  const location = useLocation();

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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route
          path="/login"
          element={!user ? <PageWrapper><LoginPage /></PageWrapper> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <PageWrapper><SignUpPage /></PageWrapper> : <Navigate to="/" />}
        />
        <Route
          path="/shared/prompt/:token"
          element={<PageWrapper><SharedPromptPage /></PageWrapper>}
        />
        <Route
          path="/shared/project/:token"
          element={<PageWrapper><SharedProjectPage /></PageWrapper>}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={user ? <PageWrapper><DashboardPage /></PageWrapper> : <Navigate to="/login" />}
        />
        <Route
          path="/editor/:id"
          element={user ? <PageWrapper><EditorPage /></PageWrapper> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={user ? <PageWrapper><SettingsPage /></PageWrapper> : <Navigate to="/login" />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;