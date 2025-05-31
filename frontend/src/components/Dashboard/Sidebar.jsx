// src/components/Dashboard/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentPlusIcon, 
  ArrowLeftOnRectangleIcon, 
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../api/axiosInstance';

import DastiLogoIcon from '../../Images/Dasti_logo_Icon.png';

const Sidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axiosInstance.post('/auth/logout');
    setUser(null);
    navigate('/');
  };

  const role = user?.rol?.nombre?.toLowerCase();
  const mostrarNuevaCotizacion = ['director','administrador','vendedores','disenador'].includes(role);
  const mostrarRegistro = ['director','administrador', 'almacen', 'compras'].includes(role);
  const mostrarSolicitudes = ['director','administrador'].includes(role);

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-orange-500 text-white p-2 rounded-full transition'
      : 'text-gray-500 hover:text-blue-500 p-2 transition';

  return (
    // Cambiado w-24 a w-20 para un sidebar más estrecho sin afectar los íconos
    <div className="w-20 flex flex-col items-center bg-white h-screen py-6 px-3">
      {/* Logo superior, tamaño reducido */}
      <div className="mb-6">
        <img
          src={DastiLogoIcon}
          alt="DASTI CORP"
          className="h-6 mx-auto"
        />
      </div>
      {/* Contenedor de íconos */}
      <div className="bg-white border border-gray-200 rounded-full p-1 flex flex-col items-center space-y-4 mt-10">
        <NavLink to="/dashboard" end className={linkClass} title="Inicio">
          <HomeIcon className="h-6 w-6" />
        </NavLink>

        {mostrarNuevaCotizacion && (
          <NavLink
            to="/dashboard/nueva-cotizacion"
            className={linkClass}
            title="Nueva Cotización"
          >
            <DocumentPlusIcon className="h-6 w-6" />
          </NavLink>
        )}

        <NavLink
          to="/dashboard/buscar-proyectos"
          className={linkClass}
          title="Buscar Proyectos"
        >
          <MagnifyingGlassIcon className="h-6 w-6" />
        </NavLink>

        {mostrarSolicitudes && (
          <NavLink
            to="/dashboard/solicitudes-aprobacion"
            className={linkClass}
            title="Solicitudes Aprobación"
          >
            <ClipboardDocumentListIcon className="h-6 w-6" />
          </NavLink>
        )}

        {mostrarRegistro && (
          <NavLink
            to="/dashboard/registro-seleccion"
            className={linkClass}
            title="Registro"
          >
            <PlusCircleIcon className="h-6 w-6" />
          </NavLink>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-blue-500 p-2 focus:outline-none mb-4 transition"
        title="Cerrar sesión"
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Sidebar;
