// AuthModal.jsx
import React from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AuthModal = ({ isOpen, onClose, mode, switchMode, onLogin }) => {
  if (!isOpen) return null;

  console.log("onLogin in AuthModal:", onLogin);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className=" p-8 rounded-lg shadow-xl w-full max-w-md">
        {mode === 'login' ? (
          <Login 
            onClose={onClose} 
            switchToRegister={() => switchMode('register')}
            onLogin={onLogin}
          />
        ) : (
          <Register 
            onClose={onClose} 
            switchToLogin={() => switchMode('login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;