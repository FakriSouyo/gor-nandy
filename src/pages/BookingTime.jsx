import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';

const BookingTime = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [bookings, setBookings] = useState([]);
  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [courtDetails, setCourtDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchCourtDetails();
  }, [currentWeek, courtId]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('court_id', courtId)
      .gte('date', currentWeek.clone().startOf('week').format('YYYY-MM-DD'))
      .lt('date', currentWeek.clone().endOf('week').format('YYYY-MM-DD'));

    if (error) {
      console.error('Error fetching bookings:', error.message);
    } else {
      setBookings(data);
    }
  };

  const fetchCourtDetails = async () => {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', courtId)
      .single();

    if (error) {
      console.error('Error fetching court details:', error.message);
    } else {
      setCourtDetails(data);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 10; i < 22; i++) {
      slots.push(`${i}:00`);
    }
    return slots;
  };

  const handleSelectionStart = (day, time) => {
    setSelection({ start: { day, time }, end: { day, time } });
    setIsSelecting(true);
  };

  const handleSelectionMove = (day, time) => {
    if (isSelecting) {
      setSelection(prev => ({
        ...prev,
        end: { day, time }
      }));
    }
  };

  const handleSelectionEnd = () => {
    setIsSelecting(false);
  };

  const isSlotSelected = (day, time) => {
    if (!selection) return false;
    const slotTime = moment(`${day.format('YYYY-MM-DD')} ${time}`);
    const startTime = moment(`${selection.start.day.format('YYYY-MM-DD')} ${selection.start.time}`);
    const endTime = moment(`${selection.end.day.format('YYYY-MM-DD')} ${selection.end.time}`).add(1, 'hour');
    return slotTime.isBetween(startTime, endTime, null, '[)');
  };

  const calculateBookingDetails = () => {
    if (!selection || !courtDetails) return null;

    const startTime = moment(`${selection.start.day.format('YYYY-MM-DD')} ${selection.start.time}`);
    const endTime = moment(`${selection.end.day.format('YYYY-MM-DD')} ${selection.end.time}`).add(1, 'hour');
    const duration = moment.duration(endTime.diff(startTime));
    const hours = duration.asHours();
    const price = hours * courtDetails.price;

    return {
      start: startTime,
      end: endTime,
      duration: hours,
      price: price,
      court_id: courtId,
    };
  };

  const renderBookingDetails = (day, time) => {
    const bookingDetails = calculateBookingDetails();
    if (!bookingDetails) return null;
  
    const slotTime = moment(`${day.format('YYYY-MM-DD')} ${time}`);
    const isStart = slotTime.isSame(bookingDetails.start);
  
    if (isStart) {
      return (
        <div className="text-xs">
          <div>Mulai: {bookingDetails.start.format('HH:mm')}</div>
          <div>Durasi: {bookingDetails.duration} jam</div>
          <div>Total: Rp {bookingDetails.price.toLocaleString()}</div>
        </div>
      );
    }
    return null;
  };

  const handleBookingSubmission = async () => {
    const bookingDetails = calculateBookingDetails();
    if (!bookingDetails) return;
  
    setIsSubmitting(true);
    try {
      // Dapatkan user saat ini
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) throw new Error('User not authenticated');
  
      const bookingData = {
        user_id: user.id,
        court_id: courtId,
        date: bookingDetails.start.format('YYYY-MM-DD'),
        time: bookingDetails.start.format('HH:mm:ss'),
        start_time: bookingDetails.start.format('HH:mm:ss'),
        end_time: bookingDetails.end.format('HH:mm:ss'),
        duration: bookingDetails.duration,
        price: bookingDetails.price,
        status: 'pending',
        payment_proof: null
      };
  
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
  
      if (error) {
        console.error('Error inserting booking:', error);
        throw error;
      } else {
        console.log('Booking inserted successfully:', data);
        
        Swal.fire({
          icon: 'success',
          title: 'Booking Submitted',
          text: 'Your booking has been submitted successfully.',
        }).then(() => {
          // Arahkan ke halaman konfirmasi pembayaran setelah user menekan OK
          navigate('/booking-confirmation', { state: { bookingId: data.id } });
        });
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderWeek = () => {
    const days = [];
    const startOfWeek = currentWeek.clone().startOf('week');

    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      days.push(day);
    }

    return (
      <table className="w-full border-collapse select-none">
        <thead>
          <tr>
            <th className="border p-2"></th>
            {days.map(day => (
              <th key={day.format('YYYY-MM-DD')} className="border p-2">
                {day.format('ddd M/D')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generateTimeSlots().map(time => (
            <tr key={time}>
              <td className="border p-2">{time}</td>
              {days.map(day => {
                const isBooked = bookings.some(
                  booking => moment(booking.date).isSame(day, 'day') && booking.start_time === time
                );
                const isSelected = isSlotSelected(day, time);
                return (
                  <td
                  key={`${day.format('YYYY-MM-DD')}-${time}`}
                  className={`border p-2 ${
                    isBooked ? 'bg-red-100 cursor-not-allowed' : 
                    isSelected ? 'bg-green-100' : 'hover:bg-gray-100'
                  }`}
                  onMouseDown={() => !isBooked && handleSelectionStart(day, time)}
                  onMouseEnter={() => !isBooked && handleSelectionMove(day, time)}
                  onMouseUp={handleSelectionEnd}
                >
                  {isBooked && <div className="text-xs pointer-events-none">Booked</div>}
                  {isSelected && renderBookingDetails(day, time)}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl  mb-6 text-center leading-tight font-modak text-green-700 ">Pilih Waktu Pemesanan</h1>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">{currentWeek.format('MMM D') + ' - ' + currentWeek.clone().endOf('week').format('D, YYYY')}</h2>
        <div>
          <button className="px-4 font-inter bg-green-500 font-semibold py-2 text-white  mr-2" onClick={() => setCurrentWeek(moment())}>Today</button>
          <button className="px-4 py-2 bg-green-500 text-white font-bold mr-2" onClick={() => setCurrentWeek(prev => prev.clone().subtract(1, 'week'))}>&lt;</button>
          <button className="px-4 py-2 bg-green-500 text-white font-bold mr-2" onClick={() => setCurrentWeek(prev => prev.clone().add(1, 'week'))}>&gt;</button>
        </div>
      </div>
      {renderWeek()}
      {calculateBookingDetails() && (
        <div className="mt-4 p-4 border rounded font-inter font-semibold text-white bg-green-500 shadow-lg">
        <h3 className="font-bold text-lg mb-2">Booking Details:</h3>
        <table className="w-full text-left">
          <tbody>
            <tr className="border-b border-green-700">
              <td className="py-2 pr-4">Lapangan:</td>
              <td className="py-2">{courtDetails?.name}</td>
            </tr>
            <tr className="border-b border-green-700">
              <td className="py-2 pr-4">Alamat:</td>
              <td className="py-2">{courtDetails?.address}</td>
            </tr>
            <tr className="border-b border-green-700">
              <td className="py-2 pr-4">Tanggal:</td>
              <td className="py-2">{calculateBookingDetails().start.format('DD/MM/YYYY')}</td>
            </tr>
            <tr className="border-b border-green-700">
              <td className="py-2 pr-4">Waktu:</td>
              <td className="py-2">{calculateBookingDetails().start.format('HH:mm')} - {calculateBookingDetails().end.format('HH:mm')}</td>
            </tr>
            <tr className="border-b border-green-700">
              <td className="py-2 pr-4">Durasi:</td>
              <td className="py-2">{calculateBookingDetails().duration} jam</td>
            </tr>
            <tr className="border-b border-green-700">
              <td className="py-2 pr-4">Harga per jam:</td>
              <td className="py-2">Rp {courtDetails?.price.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Total Harga:</td>
              <td className="py-2">Rp {calculateBookingDetails().price.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <button
          className="mt-4 bg-green-200 font-bold text-green-900 px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          onClick={handleBookingSubmission}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
        </button>
      </div>
      
      )}
    </div>
  );
};

export default BookingTime;
