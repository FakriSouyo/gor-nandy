import React, { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaHome, FaBookOpen, FaInfoCircle, FaUser, FaSignInAlt, FaTachometerAlt } from 'react-icons/fa';

const Navbar = ({ openModal, isLoggedIn, handleLogout, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const location = useLocation();
  const isAdmin = user?.is_admin;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const NavLink = ({ to, children, icon }) => {
    if (location.pathname === '/') {
      return (
        <ScrollLink to={to} smooth={true} duration={500} className={`cursor-pointer ${isScrolled ? 'text-white hover:text-green-200' : 'text-green-800 hover:text-green-600'} transition duration-300`}>
          {isMobile ? icon : children}
        </ScrollLink>
      );
    } else {
      return (
        <RouterLink to={`/#${to}`} className={`cursor-pointer ${isScrolled ? 'text-white hover:text-green-200' : 'text-green-800 hover:text-green-600'} transition duration-300`}>
          {isMobile ? icon : children}
        </RouterLink>
      );
    }
  };

  return (
    <header 
      className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2 
        w-auto p-4 rounded-full shadow-lg transition-all duration-300
        ${isScrolled 
          ? 'bg-transparent backdrop-blur-md border border-gray-100' 
          : 'bg-white border border-5 border-green-700'
        }
        z-50
      `}
    >
      <div className="flex justify-between items-center space-x-6 px-4">
        {!isMobile && (
          <div className={`text-xl font-bold ${isScrolled ? 'text-white' : 'text-green-800'}`}>
            <span className={isScrolled ? 'text-white' : 'text-black'}>Bad</span>Minton
          </div>
        )}
        <nav className="flex items-center space-x-4 font-semibold">
          <NavLink to="home" icon={<FaHome size={20} />}>Beranda</NavLink>
          {!isAdmin && (
            isLoggedIn ? (
              <RouterLink to="/booking" className={`cursor-pointer ${isScrolled ? 'text-white hover:text-green-200' : 'text-green-800 hover:text-green-600'} transition duration-300`}>
                {isMobile ? <FaBookOpen size={20} /> : 'Pesan'}
              </RouterLink>
            ) : (
              <button
                onClick={() => openModal('login')}
                className={`cursor-pointer ${isScrolled ? 'text-white hover:text-green-200' : 'text-green-800 hover:text-green-600'} transition duration-300`}
              >
                {isMobile ? <FaBookOpen size={20} /> : 'Pesan'}
              </button>
            )
          )}
          {isAdmin && (
            <RouterLink to="/admin" className={`cursor-pointer ${isScrolled ? 'text-white hover:text-green-200' : 'text-green-800 hover:text-green-600'} transition duration-300`}>
              {isMobile ? <FaTachometerAlt size={20} /> : 'Dashboard'}
            </RouterLink>
          )}
          <NavLink to="about" icon={<FaInfoCircle size={20} />}>Tentang</NavLink>
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
              >
                {isMobile ? <FaUser size={20} /> : (user && (user.user_metadata?.name || user.email))}
              </button>
              {showAccountMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <RouterLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</RouterLink>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openModal('register')}
              className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
            >
              {isMobile ? <FaSignInAlt size={20} /> : 'Daftar'}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;