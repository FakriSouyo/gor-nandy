import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Swal from 'sweetalert2';
import moment from 'moment';
import { FaCheck, FaImage, FaTimes } from 'react-icons/fa';

const PaymentConfirmation = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          courts(name),
          users!fk_user(name, email, phone)
        `)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // console.log('Fetched data:', data); 
      
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      Swal.fire('Error', 'Gagal mengambil data pembayaran', 'error');
    }
  };

  const confirmPayment = async (booking) => {
    try {
      if (!booking.court_id || !booking.date || !booking.start_time || !booking.end_time) {
        throw new Error('Data booking tidak lengkap');
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);
      if (bookingError) throw bookingError;

      const { error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          court_id: booking.court_id,
          date: booking.date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: 'booked',
          user_id: booking.user_id
        });
      
      if (scheduleError) throw scheduleError;

      Swal.fire('Berhasil', 'Pembayaran dikonfirmasi dan jadwal diperbarui', 'success');
      fetchPayments();
    } catch (error) {
      console.error('Error in confirmPayment:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const cancelBooking = async (booking) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Anda akan membatalkan booking ini!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, batalkan!',
        cancelButtonText: 'Tidak'
      });
  
      if (result.isConfirmed) {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', booking.id);
  
        if (error) throw error;
  
        Swal.fire(
          'Dibatalkan!',
          'Booking telah dibatalkan.',
          'success'
        );
        fetchPayments();
      }
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const viewPaymentProof = (payment) => {
    // console.log('Payment object:', payment); 
    const proofUrl = payment?.['payment_proof'];
    
    // console.log("Payment proof URL:", proofUrl); 
    
    if (proofUrl) {
      Swal.fire({
        title: 'Bukti Pembayaran',
        imageUrl: proofUrl,
        imageAlt: 'Bukti Pembayaran',
        imageWidth: 400,
        imageHeight: 'auto',
        showConfirmButton: false,
        showCloseButton: true,
      }).then(() => {
        const img = Swal.getImage();
        if (img && img.naturalWidth === 0) {
          Swal.fire('Error', 'Gagal memuat gambar bukti pembayaran', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'URL bukti pembayaran tidak tersedia', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {payments.length === 0 ? (
        <p>Tidak ada pembayaran yang menunggu konfirmasi.</p>
      ) : (
        payments.map(payment => (
          <div key={payment.id} className="bg-white shadow-md rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{payment.users?.name || 'Unknown'}</h3>
                <p className="text-gray-600">Email: {payment.users?.email}</p>
                <p className="text-gray-600">Telepon: {payment.users?.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Lapangan: {payment.courts?.name}</p>
                <p className="text-gray-600">Tanggal: {moment(payment.date).format('DD/MM/YYYY')}</p>
                <p className="text-gray-600">Waktu: {moment(payment.start_time, 'HH:mm:ss').format('HH:mm')} - {moment(payment.end_time, 'HH:mm:ss').format('HH:mm')}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center"
                onClick={() => viewPaymentProof(payment)}
              >
                <FaImage className="mr-2" /> Bukti Pembayaran
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                onClick={() => confirmPayment(payment)}
              >
                <FaCheck className="mr-2" /> Konfirmasi Pembayaran
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                onClick={() => cancelBooking(payment)}
              >
                <FaTimes className="mr-2" /> Batalkan Booking
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PaymentConfirmation;