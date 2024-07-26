import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Swal from 'sweetalert2';
import Loading from '../components/Loading';

const Register = ({ onClose, switchToLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });
      if (error) throw error;
      // console.log('User registered:', data.user);
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil',
        text: 'Silahkan cek email Anda untuk konfirmasi.',
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Pendaftaran Gagal',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;


  return (
    <div className=" flex items-center justify-center bg-[url('/register-bg.png')] bg-cover bg-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="font-modak text-4xl text-green-700 mb-6 text-center">Daftar BadMinton</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor HP</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
          >
            Daftar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <button onClick={switchToLogin} className="text-green-600 hover:text-green-800">
          Masuk
        </button>
      </p>
      </div>
    </div>
  );
};

export default Register;
