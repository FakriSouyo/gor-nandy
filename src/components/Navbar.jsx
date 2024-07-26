import React, { useEffect, useState, useRef } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaHome, FaBookOpen, FaInfoCircle, FaUser, FaSignInAlt, FaTachometerAlt, FaArrowUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ openModal, isLoggedIn, handleLogout, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const location = useLocation();
  const isAdmin = user?.is_admin;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      setShowScrollToTop(
        documentHeight > windowHeight && 
        scrollTop > 300
      );
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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

  const navbarVariants = {
    normal: {
      width: 'auto',
      height: 'auto',
      left: '50%',
      x: '-50%',
      right: 'auto',
    },
    backToTop: {
      width: '48px',
      height: '48px',
      left: 'auto',
      x: 0,
      right: '16px',
    }
  };

  return (
    <motion.header 
      className={`
        fixed bottom-4 
        rounded-full shadow-lg
        ${isScrolled 
          ? 'bg-transparent backdrop-blur-md border border-gray-100' 
          : 'bg-white border border-5 border-green-700'
        }
        z-50
      `}
      initial="normal"
      animate={showScrollToTop ? "backToTop" : "normal"}
      variants={navbarVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <AnimatePresence initial={false}>
        {showScrollToTop ? (
          <motion.button 
            key="backToTop"
            onClick={scrollToTop} 
            className={`
              flex items-center justify-center w-full h-full rounded-full 
              ${isScrolled ? 'bg-green-700 text-white' : 'bg-white text-green-700'} 
              hover:bg-green-600 hover:text-white transition-all duration-300 ease-in-out
            `}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaArrowUp size={20} className="animate-bounce" />
          </motion.button>
        ) : (
          <motion.div 
            key="navbar"
            className="flex justify-between items-center space-x-6 px-4 py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {!isMobile && (
              <RouterLink to="/" className={`text-xl font-bold ${isScrolled ? 'text-white' : 'text-green-800'}`}>
                <span className={isScrolled ? 'text-white' : 'text-black'}>Bad</span>Minton
              </RouterLink>
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
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
                  >
                    {isMobile ? <FaUser size={20} /> : (user && (user.user_metadata?.name || user.email))}
                  </button>
                  <AnimatePresence>
                    {showAccountMenu && (
                      <motion.div 
                        className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RouterLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</RouterLink>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keluar</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
