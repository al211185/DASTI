// src/components/Dashboard/Header.jsx
import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

const Header = () => {
  // Extraemos el usuario del contexto
  const { user } = useContext(UserContext);

  // Si el usuario aún no se carga, podrías mostrar un placeholder o spinner
  const userName = user ? user.nombre : 'Invitado';

  return (
    <header className="flex items-center justify-between bg-white p-4 shadow">
      {/* Buscador */}
      <div>
        <input
          type="text"
          placeholder="Buscar..."
          className="border rounded px-3 py-1"
        />
      </div>
      {/* Perfil */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Hola, {userName}</span>
        <img
          src="/profile.jpg"
          alt="profile"
          className="h-8 w-8 rounded-full object-cover"
        />
      </div>
    </header>
  );
};

export default Header;
