import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import About from './pages/About';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HowTo from './components/HowTo';
import Loading from './components/Loading';
import { supabase } from './services/supabaseClient';
import BookingTime from './pages/BookingTime';
import BookingConfirmation from './components/BookingConfirmation';
import AdminDashboard from './components/admin/AdminDashboard';
import NotFound from './pages/NotFound';

function AppContent({ openModal, isLoggedIn, handleLogout, user, authModal, howToModal, closeModal, switchMode, handleLogin, updateUser }) {
  const location = useLocation();
  const showNavbar = location.pathname !== '/404';

  return (
    <>
      {showNavbar && (
        <Navbar 
          openModal={openModal} 
          isLoggedIn={isLoggedIn} 
          handleLogout={handleLogout} 
          user={user} 
        />
      )}
      <Routes>
        <Route path="/" element={
          <>
            <Home openModal={openModal} isLoggedIn={isLoggedIn} />
            <Schedule />
            <About />
          </>
        } />
        <Route path="/booking" element={<Booking isLoggedIn={isLoggedIn} />} />
        <Route path="/profile" element={<Profile user={user} updateUser={updateUser} />} />
        <Route path="/booking-time/:courtId" element={<BookingTime />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation user={user} />} />
        <Route 
          path="/admin" 
          element={
            user?.is_admin
              ? <AdminDashboard /> 
              : <Navigate to="/" replace />
          } 
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={closeModal} 
        mode={authModal.mode}
        switchMode={switchMode}
        onLogin={handleLogin}
      />
      {howToModal && <HowTo onClose={closeModal} />}
    </>
  );
}

function App() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [howToModal, setHowToModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (!error && userData) {
          setUser({ ...session.user, is_admin: userData.is_admin });
        } else {
          setUser(session.user);
        }
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    };
  
    fetchSession();
  
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        fetchSession();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
      }
    });
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const openModal = (mode) => {
    if (mode === 'howTo') {
      setHowToModal(true);
    } else {
      setAuthModal({ isOpen: true, mode });
    }
  };

  const closeModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
    setHowToModal(false);
  };

  const switchMode = (newMode) => {
    setAuthModal(prev => ({ ...prev, mode: newMode }));
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('isAdmin', userData.is_admin);
    closeModal();
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setLoading(false);
    window.location.href = '/'; 
  };

  const updateUser = (updatedUser) => {
    setUser({
      ...updatedUser,
      is_admin: updatedUser.user_metadata.is_admin || updatedUser.is_admin
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <AppContent 
        openModal={openModal} 
        isLoggedIn={isLoggedIn} 
        handleLogout={handleLogout} 
        user={user}
        authModal={authModal}
        howToModal={howToModal}
        closeModal={closeModal}
        switchMode={switchMode}
        handleLogin={handleLogin}
        updateUser={updateUser}
      />
    </Router>
  );
}

export default App;