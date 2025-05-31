// src/components/Dashboard/DashboardLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
