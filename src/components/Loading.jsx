// components/Loading.jsx
import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/lottie.json'; // Adjust this path as needed

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
      <div className="w-24 h-24 mb-4">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
      <h2 className="text-center text-white text-xl font-semibold">Loading...</h2>
      <p className="w-1/3 text-center text-white">Ini mungkin membutuhkan beberapa detik, harap tunggu.</p>
    </div>
  );
};

export default Loading;