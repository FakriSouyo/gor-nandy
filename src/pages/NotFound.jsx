import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-300 to-green-500 text-white p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="text-center"
      >
        <h1 className="font-modak text-9xl pb-2 mb-8 text-white leading-tight">404</h1>
        <motion.p 
          className="text-3xl mb-8 font-bold"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Oops! Sepertinya kamu tersesat di hutan lapangan...
        </motion.p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl mb-8 text-center"
      >
        <p className='font-semibold'>Jangan khawatir, bahkan bola pun kadang-kadang keluar lapangan!</p>
        <p className="font-semibold mt-4">Mari kita kembali ke home base, eh... homepage!</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link 
          to="/" 
          className="px-8 py-4 bg-green-400 text-white-800 rounded-full font-bold text-xl hover:bg-green-300 transition-colors duration-300 shadow-lg"
        >
          Kembali
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;