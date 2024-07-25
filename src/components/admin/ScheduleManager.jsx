// src/components/admin/ScheduleManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import moment from 'moment';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        courts(name),
        users!fk_schedules_user(id, name)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching schedules:', error);
    } else {
      setSchedules(data);
    }
  };

  const updateScheduleStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      Swal.fire('Berhasil', 'Status jadwal diperbarui', 'success');
      fetchSchedules();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const deleteSchedule = async (id) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      Swal.fire('Berhasil', 'Jadwal dihapus', 'success');
      fetchSchedules();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {schedules.map(schedule => (
        <div key={schedule.id} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{schedule.users?.name || 'N/A'}</h3>
              <p className="text-gray-600">Lapangan: {schedule.courts.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Tanggal: {moment(schedule.date).format('DD/MM/YYYY')}</p>
              <p className="text-gray-600">Waktu: {moment(schedule.start_time, 'HH:mm:ss').format('HH:mm')} - {moment(schedule.end_time, 'HH:mm:ss').format('HH:mm')}</p>
              <p className="text-gray-600">Status: {schedule.status}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
              onClick={() => updateScheduleStatus(schedule.id, schedule.status === 'available' ? 'booked' : 'available')}
            >
              <FaEdit className="mr-2" /> Ubah Status
            </button>
            <button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center"
              onClick={() => deleteSchedule(schedule.id)}
            >
              <FaTrash className="mr-2" /> Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleManager;