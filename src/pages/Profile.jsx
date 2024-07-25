import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';
import moment from 'moment';

const Profile = ({ user, updateUser }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const isAdmin = user?.is_admin;
  const [profilePicture, setProfilePicture] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

  useEffect(() => {
    if (user) {
      if (!isAdmin) {
        fetchBookings();
      }
      setName(user.user_metadata.name || '');
      setPhone(user.user_metadata.phone || '');
      setProfilePicture(user.user_metadata.avatar_url || null);
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    console.log('Current user:', user); // Log untuk debugging
  }, [user]);

  useEffect(() => {
    if (!isAdmin) {
      filterBookings(activeTab);
    }
  }, [bookings, activeTab, isAdmin]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, courts(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data);
    }
  };

  const filterBookings = (status) => {
    if (status === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === status));
    }
    setCurrentPage(1);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
  
    try {
      setLoading(true);
      const { error: uploadError } = await supabase.storage
        .from('profile-picture')
        .upload(filePath, file);
  
      if (uploadError) {
        throw uploadError;
      }
  
      const { data: urlData, error: urlError } = supabase.storage
        .from('profile-picture')
        .getPublicUrl(filePath);
  
      if (urlError) {
        throw urlError;
      }
  
      const avatarUrl = urlData.publicUrl;
      setProfilePicture(avatarUrl);
  
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
  
      if (updateError) {
        throw updateError;
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Profile Picture Updated',
        text: 'Your profile picture has been successfully updated.',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name, phone, avatar_url: profilePicture, is_admin: isAdmin }
      });
  
      if (error) throw error;
  
      const { data: { user: updatedUser }, error: fetchError } = await supabase.auth.getUser();
      if (fetchError) throw fetchError;
  
      console.log('Updated user:', updatedUser); // Log untuk debugging
  
      updateUser(updatedUser);
  
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been successfully updated.',
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (status) => {
    setActiveTab(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      case 'confirmed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      Swal.fire('Berhasil', 'Pemesanan telah dibatalkan', 'success');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Loading />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 p-8">
            <img className="h-48 w-48 rounded-full object-cover" src={profilePicture || "/profile-placeholder.jpg"} alt="User profile" />
            {editing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-2"
              />
            )}
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-green-500 font-semibold">
              {isAdmin ? 'Admin Profile' : 'User Profile'}
            </div>
            {editing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
              </>
            ) : (
              <>
                <h2 className="block mt-1 text-2xl leading-tight font-bold text-black">{user.user_metadata.name}</h2>
                <p className="mt-2 text-gray-500">Email: {user.email}</p>
                <p className="mt-2 text-gray-500">Phone: {user.user_metadata.phone}</p>
                {isAdmin && <p className="mt-2 text-green-500 font-semibold">Admin Account</p>}
              </>
            )}
            {editing ? (
              <button onClick={handleSave} className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Save
              </button>
            ) : (
              <button onClick={handleEdit} className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Edit Profile
              </button>
            )}
          </div>
        </div>
        {!isAdmin && (
          <div className="p-8 bg-gray-50">
            <h3 className="text-xl font-semibold text-green-600 mb-4">Riwayat pemesanan</h3>
            <div className="flex mb-4">
              <button 
                className={`mr-2 px-4 py-2 ${activeTab === 'all' ? 'bg-green-500' : 'bg-gray-300'} text-white rounded`}
                onClick={() => handleTabChange('all')}
              >
                Semua
              </button>
              <button 
                className={`mr-2 px-4 py-2 ${activeTab === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'} text-white rounded`}
                onClick={() => handleTabChange('pending')}
              >
                Pending
              </button>
              <button 
                className={`mr-2 px-4 py-2 ${activeTab === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'} text-white rounded`}
                onClick={() => handleTabChange('cancelled')}
              >
                Dibatalkan
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'confirmed' ? 'bg-green-500' : 'bg-gray-300'} text-white rounded`}
                onClick={() => handleTabChange('confirmed')}
              >
                Berhasil
              </button>
            </div>
            {currentBookings.length > 0 ? (
              <div className="space-y-4">
                {currentBookings.map((booking) => (
                  <div key={booking.id} className="bg-white p-4 rounded-lg shadow">
                    <p className="font-semibold text-green-600">Lapangan: {booking.courts.name}</p>
                    <p>Tanggal: {moment(booking.date).format('DD/MM/YYYY')}</p>
                    <p>Waktu: {moment(booking.start_time, 'HH:mm:ss').format('HH:mm')} - {moment(booking.end_time, 'HH:mm:ss').format('HH:mm')}</p>
                    <p className={`font-semibold ${getStatusColor(booking.status)}`}>
                      Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </p>
                    <p>Total Harga: Rp {booking.price.toLocaleString()}</p>
                    <p>Tanggal Pesan: {moment(booking.created_at).format('DD/MM/YYYY HH:mm')}</p>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Batalkan Pemesanan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada riwayat pemesanan yang tersedia untuk status ini.</p>
            )}
            <Pagination
              bookingsPerPage={bookingsPerPage}
              totalBookings={filteredBookings.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Komponen Pagination
const Pagination = ({ bookingsPerPage, totalBookings, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalBookings / bookingsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-4">
      <ul className="flex justify-center">
        {pageNumbers.map(number => (
          <li key={number} className="mx-1">
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded ${currentPage === number ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Profile;