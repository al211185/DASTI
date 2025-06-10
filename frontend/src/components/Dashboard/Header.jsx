// src/components/Dashboard/Header.jsx
import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import LogoLetters from '../../Images/Dasti_logo_Letras.png';
import { UserCircleIcon } from '@heroicons/react/24/outline';
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

      <div className="ml-auto flex items-center">
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
      </div>
    </header>
  );
};

export default Header;
