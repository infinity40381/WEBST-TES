import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';

// Firebase
import { auth } from './firebase/config';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import PostDetail from './pages/PostDetail';
import NotFound from './pages/NotFound';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Notifications from './pages/Notifications';
import LiveStream from './pages/LiveStream';

// Components
import Layout from './components/layout/Layout';
import Loading from './components/ui/Loading';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Translations
import en from './translations/en.json';
import tr from './translations/tr.json';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

const messages: Record<string, Record<string, string>> = {
  en,
  tr
};

function App() {
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('en');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" />
          {loading ? (
            <Loading />
          ) : (
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings setLocale={setLocale} /></Layout></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
              <Route path="/messages/:id" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
              <Route path="/live-stream" element={<ProtectedRoute><Layout><LiveStream /></Layout></ProtectedRoute>} />
              <Route path="/post/:id" element={<ProtectedRoute><Layout><PostDetail /></Layout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </AuthProvider>
      </ThemeProvider>
    </IntlProvider>
  );
}

export default App;
