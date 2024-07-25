import React from 'react';

const HowTo = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="font-modak text-4xl text-green-700 mb-6 text-center">Cara Memesan Lapangan</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700">
          <li>Klik tombol "Pesan" di menu navigasi.</li>
          <li>Pilih lapangan yang tersedia sesuai dengan preferensi Anda.</li>
          <li>Pilih tanggal dan waktu yang diinginkan.</li>
          <li>Konfirmasi pesanan Anda.</li>
          <li>Lakukan pembayaran sesuai dengan metode yang tersedia.</li>
          <li>Tunggu konfirmasi booking dari kami.</li>
          <li>Datang ke lapangan sesuai waktu yang telah dipesan.</li>
        </ol>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default HowTo;