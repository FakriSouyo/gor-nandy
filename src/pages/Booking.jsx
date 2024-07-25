import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courts.map((court) => (
          <div key={court.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
            <img src={court.image} alt={court.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2 text-green-600">{court.name}</h2>
              <p className="text-gray-600 mb-2">Harga: Rp {court.price.toLocaleString()} / jam</p>
              <p className="text-gray-600 mb-4">Alamat: {court.address}</p>
              <button 
                onClick={() => handleCourtSelection(court.id)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Pilih Lapangan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Booking;