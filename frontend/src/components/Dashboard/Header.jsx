// src/components/Dashboard/Header.jsx
import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import LogoLetters from '../../Images/Dasti_logo_Letras.png';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import NotificationsDropdown from '../NotificationsDropdown';

const Header = () => {
  const { user, loading } = useContext(UserContext);
  const name = loading ? 'Cargando…' : user?.nombre ?? 'Invitado';
  const role = loading ? '' : user?.rol?.nombre ?? '';

  return (
    <header className="flex items-center bg-white px-6 py-4">
      {/* Logo */}
      <div className="flex-shrink-0">
        <img src={LogoLetters} alt="DASTI-CORP" className="h-6" />
      </div>

      {/* Buscador */}
      <div className="w-72 ml-auto mr-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full h-10 bg-gray-200 placeholder-gray-500 text-gray-700 rounded-full pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Aquí va el dropdown de notificaciones */}
      <NotificationsDropdown />

      {/* Espacio entre campana y perfil */}
      <div className="mx-4" />

      {/* Perfil con nombre y rol */}
      <button
        type="button"
        className="flex items-center space-x-3 bg-white border border-gray-300 rounded-full px-4 h-10 focus:outline-none"
      >
        <UserCircleIcon className="h-6 w-6 text-gray-500" />
        <div className="flex flex-col leading-tight">
          <span className="text-gray-800 font-medium text-sm">{name}</span>
          <span className="text-gray-600 text-xs">{role}</span>
        </div>
      </button>
    </header>
  );
};

export default Header;
