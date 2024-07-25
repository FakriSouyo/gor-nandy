import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CourtManager = () => {
  const [courts, setCourts] = useState([]);
  const [newCourt, setNewCourt] = useState({ name: '', status: 'active', address: '', price: 0 });
  const [editingCourt, setEditingCourt] = useState(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    const { data, error } = await supabase.from('courts').select('*');
    if (error) console.error('Error fetching courts:', error);
    else setCourts(data);
  };

  const addCourt = async () => {
    const { error } = await supabase.from('courts').insert([newCourt]);
    if (error) console.error('Error adding court:', error);
    else {
      fetchCourts();
      setNewCourt({ name: '', status: 'active', address: '', price: 0 });
    }
  };

  const startEditing = (court) => {
    setEditingCourt({ ...court });
  };

  const cancelEditing = () => {
    setEditingCourt(null);
  };

  const saveCourt = async () => {
    const { error } = await supabase
      .from('courts')
      .update({
        name: editingCourt.name,
        status: editingCourt.status,
        address: editingCourt.address,
        price: editingCourt.price
      })
      .eq('id', editingCourt.id);

    if (error) console.error('Error updating court:', error);
    else {
      fetchCourts();
      setEditingCourt(null);
    }
  };

  const deleteCourt = async (id) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: "Lapangan ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase
          .from('courts')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting court:', error);
          Swal.fire('Error', 'Gagal menghapus lapangan', 'error');
        } else {
          fetchCourts();
          Swal.fire('Terhapus!', 'Lapangan telah dihapus.', 'success');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Tambah Lapangan Baru</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={newCourt.name}
            onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
            placeholder="Nama Lapangan"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            value={newCourt.address}
            onChange={(e) => setNewCourt({ ...newCourt, address: e.target.value })}
            placeholder="Alamat Lapangan"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            value={newCourt.price}
            onChange={(e) => setNewCourt({ ...newCourt, price: parseFloat(e.target.value) })}
            placeholder="Harga per Jam"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={addCourt}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Tambah
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courts.map(court => (
          <div key={court.id} className="bg-white shadow-md rounded-lg p-6">
            {editingCourt && editingCourt.id === court.id ? (
              <>
                <input
                  type="text"
                  value={editingCourt.name}
                  onChange={(e) => setEditingCourt({ ...editingCourt, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                />
                <input
                  type="text"
                  value={editingCourt.address}
                  onChange={(e) => setEditingCourt({ ...editingCourt, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                />
                <input
                  type="number"
                  value={editingCourt.price}
                  onChange={(e) => setEditingCourt({ ...editingCourt, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                />
                <select
                  value={editingCourt.status}
                  onChange={(e) => setEditingCourt({ ...editingCourt, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={saveCourt}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  >
                    Batal
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">{court.name}</h3>
                <p className="text-gray-600 mb-1">Alamat: {court.address}</p>
                <p className="text-gray-600 mb-1">Harga: Rp {court.price.toLocaleString()} / jam</p>
                <p className="text-gray-600 mb-4">Status: {court.status}</p>
                <div className="flex space-x-2">
                  <button
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center"
                    onClick={() => startEditing(court)}
                  >
                    <FaEdit className="mr-2" /> Edit
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center"
                    onClick={() => deleteCourt(court.id)}
                  >
                    <FaTrash className="mr-2" /> Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourtManager;