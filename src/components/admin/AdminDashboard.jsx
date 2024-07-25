// src/components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import ScheduleManager from './ScheduleManager';
import PaymentConfirmation from './PaymentConfirmation';
import CourtManager from './CourtManager';
import UserList from './UserList';
import { FaBars, FaTimes } from 'react-icons/fa';
import TransactionHistory from './TransactionHistory';
import AdminDashboardStats from './AdminDashboardStats'; // Import komponen baru

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <AdminDashboardStats />;
      case 'Jadwal':
        return <ScheduleManager />;
      case 'Pembayaran':
        return <PaymentConfirmation />;
      case 'Lapangan':
        return <CourtManager />;
      case 'User':
        return <UserList />;
      case 'Transaksi':
        return <TransactionHistory />;
      default:
        return <AdminDashboardStats />;
    }
  };

  const tabs = ['Dashboard', 'Jadwal', 'Pembayaran', 'Lapangan', 'User', 'Transaksi'];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex w-64 bg-green-800 text-white flex-shrink-0">
        <div className="w-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="mt-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`w-full text-left py-3 px-4 transition-colors duration-200 ${
                  activeTab === tab ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-64 bg-green-800 text-white">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`w-full text-left py-3 px-4 transition-colors duration-200 ${
                  activeTab === tab ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-800">
                {activeTab}
              </h2>
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;