import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Booking = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    const { data, error } = await supabase.from('courts').select('*');
    if (error) {
      console.error('Error fetching courts:', error);
    } else {
      setCourts(data);
    }
  };

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleCourtSelection = (courtId) => {
    navigate(`/booking-time/${courtId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-green-700">Pilih Lapangan</h1>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          {courts.map((court) => (
            <div key={court.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
              <div className="relative">
                <img src={court.image} alt={court.name} className="w-full h-56 object-cover" />
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
                  Tersedia
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-green-600">{court.name}</h2>
                <p className="text-gray-700 font-semibold mb-2">
                  Rp {court.price.toLocaleString()} <span className="text-gray-500 font-normal">/ jam</span>
                </p>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaMapMarkerAlt className="mr-2" />
                  <p>{court.address}</p>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaClock className="mr-2" />
                  <p>Aktif</p>
                </div>
                <button 
                  onClick={() => handleCourtSelection(court.id)}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 transform hover:scale-105"
                >
                  Pilih Lapangan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Booking;