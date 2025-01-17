import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addHours, isSameDay, isWithinInterval, addDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';
import { FaCalendarAlt, FaClock, FaMoneyBillWave, FaMapMarkerAlt } from 'react-icons/fa';

const BookingTime = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [courtDetails, setCourtDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState('desktop');
  const [startSelection, setStartSelection] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchBookings();
    fetchCourtDetails();
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, [currentWeek, courtId]);

  const checkDeviceType = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchBookings = async () => {
    const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('court_id', courtId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lt('date', format(endDate, 'yyyy-MM-dd'));

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
    return Array.from({ length: 12 }, (_, i) => format(addHours(new Date().setHours(10, 0, 0, 0), i), 'HH:mm'));
  };

  const handleSelectionStart = (day, time) => {
    setSelection({ start: new Date(day.setHours(...time.split(':'))), end: new Date(day.setHours(...time.split(':'))) });
    setIsSelecting(true);
  };

  const handleSelectionMove = (day, time) => {
    if (isSelecting) {
      setSelection(prev => ({
        ...prev,
        end: new Date(day.setHours(...time.split(':')))
      }));
    }
  };

  const handleSelectionEnd = () => {
    setIsSelecting(false);
  };

  const handleCellClick = (day, time) => {
    if (selectionMode === 'mobile') {
      if (!startSelection) {
        setStartSelection({ day, time });
        handleSelectionStart(day, time);
      } else {
        const endSelection = { day, time };
        const start = new Date(startSelection.day.setHours(...startSelection.time.split(':')));
        const end = new Date(endSelection.day.setHours(...endSelection.time.split(':')));
        setSelection({ start: start < end ? start : end, end: start > end ? start : end });
        handleSelectionEnd();
        setStartSelection(null);
      }
    } else {
      handleSelectionStart(day, time);
      handleSelectionEnd();
    }
  };

  const isSlotSelected = (day, time) => {
    if (!selection) return false;
    const slotTime = new Date(day.setHours(...time.split(':')));
    return isWithinInterval(slotTime, { start: selection.start, end: addHours(selection.end, 1) });
  };

  const calculateBookingDetails = () => {
    if (!selection || !courtDetails) return null;

    const duration = (selection.end - selection.start) / (1000 * 60 * 60) + 1;
    const price = duration * courtDetails.price;

    return {
      start: selection.start,
      end: addHours(selection.end, 1),
      duration,
      price,
      court_id: courtId,
    };
  };

  const renderBookingDetails = (day, time) => {
    const bookingDetails = calculateBookingDetails();
    if (!bookingDetails) return null;
  
    const slotTime = new Date(day.setHours(...time.split(':')));
    const isStart = isSameDay(slotTime, bookingDetails.start) && format(slotTime, 'HH:mm') === format(bookingDetails.start, 'HH:mm');
  
    if (isStart) {
      return (
        <div className="text-xs">
          <div>Mulai: {format(bookingDetails.start, 'HH:mm')}</div>
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
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) throw new Error('User not authenticated');
  
      const bookingData = {
        user_id: user.id,
        court_id: courtId,
        date: format(bookingDetails.start, 'yyyy-MM-dd'),
        time: format(bookingDetails.start, 'HH:mm:ss'),
        start_time: format(bookingDetails.start, 'HH:mm:ss'),
        end_time: format(bookingDetails.end, 'HH:mm:ss'),
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
        Swal.fire({
          icon: 'success',
          title: 'Booking Submitted',
          text: 'Your booking has been submitted successfully.',
        }).then(() => {
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
    const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full border-collapse select-none bg-white rounded-lg shadow-lg">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="border p-2 sticky left-0 bg-green-500 z-10"></th>
              {days.map(day => (
                <th key={format(day, 'yyyy-MM-dd')} className="border p-2">
                  <div className="font-bold">{format(day, 'EEE', { locale: id })}</div>
                  <div>{format(day, 'd MMM', { locale: id })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generateTimeSlots().map(time => (
              <tr key={time}>
                <td className="border p-2 sticky left-0 bg-white z-10 font-semibold">{time}</td>
                {days.map(day => {
                  const isBooked = bookings.some(
                    booking => isSameDay(parseISO(booking.date), day) && booking.start_time === time
                  );
                  const isSelected = isSlotSelected(day, time);
                  return (
                    <td
                      key={`${format(day, 'yyyy-MM-dd')}-${time}`}
                      className={`border p-2 ${
                        isBooked ? 'bg-red-100 cursor-not-allowed' : 
                        isSelected ? 'bg-green-100' : 'hover:bg-gray-100'
                      } transition-all duration-200`}
                      onMouseDown={() => !isBooked && selectionMode === 'desktop' && handleSelectionStart(day, time)}
                      onMouseEnter={() => !isBooked && selectionMode === 'desktop' && handleSelectionMove(day, time)}
                      onMouseUp={() => selectionMode === 'desktop' && handleSelectionEnd()}
                      onClick={() => !isBooked && selectionMode === 'mobile' && handleCellClick(day, time)}
                    >
                      {isBooked && <div className="text-xs text-red-600 font-semibold pointer-events-none">Booked</div>}
                      {isSelected && renderBookingDetails(day, time)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-5xl mb-8 text-center leading-tight font-modak text-green-700 shadow-text">Pilih Waktu Pemesanan</h1>
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-green-700">
          {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "d MMMM", { locale: id })} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "d MMMM yyyy", { locale: id })}
        </h2>
        <div>
          <button className="px-4 font-inter bg-green-500 font-semibold py-2 text-white rounded-l-lg hover:bg-green-600 transition-colors duration-200" onClick={() => setCurrentWeek(new Date())}>Hari Ini</button>
          <button className="px-4 py-2 bg-green-500 text-white font-bold hover:bg-green-600 transition-colors duration-200" onClick={() => setCurrentWeek(date => addDays(date, -7))}>&lt;</button>
          <button className="px-4 py-2 bg-green-500 text-white font-bold rounded-r-lg hover:bg-green-600 transition-colors duration-200" onClick={() => setCurrentWeek(date => addDays(date, 7))}>&gt;</button>
        </div>
      </div>
      {isMobile && (
        <button
          onClick={() => setSelectionMode(mode => mode === 'desktop' ? 'mobile' : 'desktop')}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
        >
          {selectionMode === 'desktop' ? 'Aktifkan Mode Pemilihan Mobile' : 'Aktifkan Mode Pemilihan Desktop'}
        </button>
      )}
      {renderWeek()}
      {calculateBookingDetails() && (
        <div className="mt-6 p-6 border rounded-lg font-inter font-semibold text-gray-800 bg-white shadow-lg">
          <h3 className="font-bold text-2xl mb-4 text-green-700">Ringkasan Pemesanan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="flex items-center mb-2"><FaMapMarkerAlt className="mr-2 text-green-500" /> Lapangan: {courtDetails?.name}</p>
              <p className="flex items-center mb-2"><FaMapMarkerAlt className="mr-2 text-green-500" /> Alamat: {courtDetails?.address}</p>
              <p className="flex items-center mb-2">
                <FaCalendarAlt className="mr-2 text-green-500" /> 
                Tanggal: {format(calculateBookingDetails().start, "EEEE, d MMMM yyyy", { locale: id })}
              </p>
              <p className="flex items-center mb-2">
                <FaClock className="mr-2 text-green-500" /> 
                Waktu: {format(calculateBookingDetails().start, "HH:mm")} - {format(calculateBookingDetails().end, "HH:mm")}
              </p>
            </div>
            <div>
              <p className="flex items-center mb-2"><FaClock className="mr-2 text-green-500" /> Durasi: {calculateBookingDetails().duration} jam</p>
              <p className="flex items-center mb-2"><FaMoneyBillWave className="mr-2 text-green-500" /> Harga per jam: Rp {courtDetails?.price.toLocaleString()}</p>
              <p className="flex items-center mb-2 text-xl font-bold text-green-700">
                <FaMoneyBillWave className="mr-2 text-green-500" /> Total Harga: Rp {calculateBookingDetails().price.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            className="mt-6 bg-green-500 font-bold text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors duration-200 w-full md:w-auto"
            onClick={handleBookingSubmission}
            disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingTime;