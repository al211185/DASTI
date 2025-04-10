// src/components/Dashboard/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  return (
    <div className="w-20 flex flex-col items-center bg-white border-r">
      <div className="mt-4 mb-6">
        <img
          src="/logo.png"
          alt="DASTI-CORP"
          className="h-8 mx-auto"
        />
      </div>
      <nav className="flex flex-col space-y-4">
        <Link to="/dashboard" className="text-gray-500 hover:text-blue-500">
          <HomeIcon className="h-6 w-6" />
        </Link>
        <Link to="/dashboard/nueva-cotizacion" className="text-gray-500 hover:text-blue-500">
          <DocumentPlusIcon className="h-6 w-6" />
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
