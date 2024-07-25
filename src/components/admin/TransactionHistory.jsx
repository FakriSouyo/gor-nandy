// src/components/admin/TransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import moment from 'moment';
import { FaSearch, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, date, start_time, end_time, status, total_price, payment_proof,
          courts(name),
          users!fk_user(name, email)
        `)
        .order('created_at', { ascending: false });
    
      if (error) throw error;
      
      console.log('Received transactions:', data);
      
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Gagal mengambil data transaksi. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.courts.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const viewPaymentProof = (proofUrl) => {
    if (proofUrl) {
      Swal.fire({
        title: 'Bukti Pembayaran',
        imageUrl: proofUrl,
        imageAlt: 'Bukti Pembayaran',
        imageWidth: 400,
        imageHeight: 'auto',
        showConfirmButton: false,
        showCloseButton: true,
      });
    } else {
      Swal.fire('Error', 'Bukti pembayaran tidak tersedia', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center bg-white shadow-md rounded-lg p-4">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari transaksi..."
          className="flex-grow outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">Memuat data...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lapangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.users?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.courts?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date ? moment(transaction.date).format('DD/MM/YYYY') : 'N/A'} 
                    {transaction.start_time ? transaction.start_time.slice(0, 5) : ''} - 
                    {transaction.end_time ? transaction.end_time.slice(0, 5) : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status ? (transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.total_price != null 
                      ? `Rp ${transaction.total_price.toLocaleString()}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => viewPaymentProof(transaction.payment_proof)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye className="inline mr-1" /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;