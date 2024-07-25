import React from 'react';
import { Link } from 'react-scroll';
import { motion, useInView } from 'framer-motion';

const Home = ({ openModal, isLoggedIn }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div id="home" className="min-h-screen flex flex-col font-inter">
      <main className="flex-grow flex items-center px-12 bg-[url('/a1.png')] bg-right bg-cover bg-no-repeat">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="mb-40 pb-40"
        >
          <motion.h1 
            className="font-modak text-6xl pb-2 mb-8 text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Gampang Boking,<br/> Seru Mainnya!
          </motion.h1>
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <Link to="schedule" smooth={true} duration={500}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-100 text-green-700 px-8 py-3 rounded hover:bg-transparent border border-3 border-green-100 hover:border-green-400 hover:text-white transition duration-300 font-bold"
              >
                Lihat Jadwal
              </motion.button>
            </Link>
            {isLoggedIn ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('howTo')}
                className="bg-green-100 text-green-700 px-8 py-3 rounded hover:bg-transparent border border-3 border-green-100 hover:border-green-400 hover:text-white transition duration-300 font-bold"
              >
                Cara Pesan
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('login')}
                className="bg-green-100 text-green-700 px-8 py-3 rounded hover:bg-transparent border border-3 border-green-100 hover:border-green-400 hover:text-white transition duration-300 font-bold"
              >
                Masuk
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default Home;