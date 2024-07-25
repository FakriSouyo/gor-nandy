// src/components/admin/AdminDashboardStats.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";


const AdminDashboardStats = () => {
  const [stats, setStats] = useState({
    totalCourts: 0,
    totalUsers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
  });

  const [bookingData, setBookingData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchBookingData();
  }, []);

  const fetchStats = async () => {
    const { data: courts } = await supabase.from('courts').select('count');
    const { data: users } = await supabase.from('users').select('count');
    const { data: bookings } = await supabase.from('bookings').select('status');

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    setStats({
      totalCourts: courts[0].count,
      totalUsers: users[0].count,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
    });
  };

  const fetchBookingData = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('date, status')
      .order('date', { ascending: true })
      .limit(30);

    const processedData = data.reduce((acc, booking) => {
      const date = new Date(booking.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, confirmed: 0, pending: 0, cancelled: 0 };
      }
      acc[date][booking.status]++;
      return acc;
    }, {});

    setBookingData(Object.values(processedData));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
     <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCourts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pemesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemesanan Dikonfirmasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Statistik Pemesanan (30 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Bar dataKey="confirmed" fill="#4ade80" />
              <Bar dataKey="pending" fill="#fbbf24" />
              <Bar dataKey="cancelled" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardStats;