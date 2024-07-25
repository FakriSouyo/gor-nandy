import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Loading from './Loading';
import backgroundImage from '../assets/b.png'; // Sesuaikan path jika diperlukan

const BookingConfirmation = ({ onConfirm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = location.state || {};
  const [bookingDetails, setBookingDetails] = useState(null);
  const [courtDetails, setCourtDetails] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;
        setBookingDetails(bookingData);

        const { data: courtData, error: courtError } = await supabase
          .from('courts')
          .select('*')
          .eq('id', bookingData.court_id)
          .single();

        if (courtError) throw courtError;
        setCourtDetails(courtData);
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentProof) {
      Swal.fire('Error', 'Please upload payment proof', 'error');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');
  
      const fileName = `proof_${user.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof);
  
      if (error) throw error;
  
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);
  
      if (urlError) throw urlError;
  
      // Calculate total price
      const totalPrice = bookingDetails.price * bookingDetails.duration;
  
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          payment_proof: publicUrl,
          status: 'pending',
          total_price: totalPrice
        })
        .eq('id', bookingId)
        .eq('user_id', user.id);
  
      if (bookingError) throw bookingError;
  
      Swal.fire({
        icon: 'success',
        title: 'Bukti Pembayaran Berhasil',
        text: 'Pemesan sedang pending menunggu konfirmasi admin.',
      }).then(() => {
        navigate('/profile');
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPaymentProof(file);
  };

  if (loading) {
    return <Loading />;
  }

  if (!bookingDetails || !courtDetails) {
    return <Loading />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg font-mono mb-20">
        <h2 className="text-2xl font-bold mb-4 text-center">INFORMASI PEMESANAN</h2>
        <p className="text-center mb-4">KONFIRMASI PEMESANAN</p>
        <div className="border-t border-b border-gray-300 py-2 mb-4">
          <p>ID #{bookingId.toString().padStart(4, '0')}</p>
          <p>{moment(bookingDetails.date).format('dddd, MMMM D, YYYY').toUpperCase()}</p>
        </div>
        <div className="mb-4">
          <div className="flex justify-between">
            <span>ITEM</span>
            <span>DETAILS</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal</span>
            <span>{moment(bookingDetails.date).format('DD/MM/YYYY')}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu</span>
            <span>{`${moment(bookingDetails.start_time, 'HH:mm:ss').format('HH:mm')} - ${moment(bookingDetails.end_time, 'HH:mm:ss').format('HH:mm')}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Lapangan</span>
            <span>{courtDetails.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Harga/Jam</span>
            <span>Rp {courtDetails.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-2 mb-4">
          <div className="flex justify-between font-bold">
            <span>TOTAL:</span>
            <span>Rp {bookingDetails.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-bold">Informasi Bayar:</h3>
          <p>Bank Account: 1234-5678-9012-3456</p>
          <p>Account Name: BadMinton Court</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Unggah Bukti Pembayaran</label>
            <input type="file" onChange={handleFileChange} accept="image/*" required />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingConfirmation;
