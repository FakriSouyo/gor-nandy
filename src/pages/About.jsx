import React from 'react';
import { motion, useInView } from 'framer-motion';

const About = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div 
      ref={ref}
      id="about" 
      className="min-h-screen flex items-center justify-center bg-[url('/b.png')] bg-cover bg-center"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl max-w-4xl"
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <motion.h2 
          className="font-modak text-5xl text-green-700 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Tentang BadMinton
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-700 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          BadMinton adalah platform inovatif yang menghubungkan pecinta bulutangkis dengan lapangan terbaik di kota Anda. Kami berkomitmen untuk membuat olahraga ini lebih mudah diakses dan menyenangkan bagi semua orang.
        </motion.p>
        <motion.p 
          className="text-lg text-gray-700 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Dengan BadMinton, Anda dapat dengan mudah memesan lapangan, mengatur jadwal permainan, dan terhubung dengan komunitas bulutangkis lokal. Kami percaya bahwa bermain bulutangkis bukan hanya tentang olahraga, tetapi juga tentang membangun persahabatan dan menciptakan kenangan.
        </motion.p>
        <motion.div 
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <h3 className="font-bold text-2xl text-green-700 mb-4">Mengapa Memilih BadMinton?</h3>
          <ul className="list-disc list-inside text-gray-700">
            <motion.li 
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Pemesanan lapangan yang cepat dan mudah
            </motion.li>
            <motion.li 
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              Jaringan lapangan bulutangkis terluas
            </motion.li>
            <motion.li 
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              Komunitas pemain yang ramah dan aktif
            </motion.li>
            <motion.li 
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Harga yang transparan dan kompetitif
            </motion.li>
            <motion.li 
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
            >
              Dukungan pelanggan 24/7
            </motion.li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default About;