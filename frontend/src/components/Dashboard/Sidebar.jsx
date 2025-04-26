// src/components/Dashboard/Sidebar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentPlusIcon, 
  ArrowLeftOnRectangleIcon, 
  PlusCircleIcon,
  MagnifyingGlassIcon,
  // icono para solicitudes:
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../api/axiosInstance';

const Sidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Sólo Director y Administrador ven los registros (ya tenías esto):
  const mostrarRegistro =
    user?.rol?.nombre &&
    ['director','administrador'].includes(user.rol.nombre.toLowerCase());

  // Sólo Director y Administrador ven las solicitudes de aprobación:
  const mostrarSolicitudes =
    user?.rol?.nombre &&
    ['director','administrador'].includes(user.rol.nombre.toLowerCase());

  return (
    <div className="w-20 flex flex-col items-center bg-white border-r h-screen">
      <div className="mt-4 mb-6">
        <img src="/logo.png" alt="DASTI-CORP" className="h-8 mx-auto" />
      </div>
      <nav className="flex flex-col space-y-4">
        <Link to="/dashboard" className="text-gray-500 hover:text-blue-500" title="Inicio">
          <HomeIcon className="h-6 w-6" />
        </Link>
        <Link to="/dashboard/nueva-cotizacion" className="text-gray-500 hover:text-blue-500" title="Nueva Cotización">
          <DocumentPlusIcon className="h-6 w-6" />
        </Link>
        <Link to="/dashboard/buscar-proyectos" className="text-gray-500 hover:text-blue-500" title="Buscar Proyectos">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </Link>

        {/* Enlace a Solicitudes de Aprobación */}
        {mostrarSolicitudes && (
          <Link
            to="/dashboard/solicitudes-aprobacion"
            className="text-gray-500 hover:text-blue-500"
            title="Solicitudes Aprobación"
          >
            <ClipboardDocumentListIcon className="h-6 w-6" />
          </Link>
        )}

        {/* Registro (planta, clientes, etc.) */}
        {mostrarRegistro && (
          <Link to="/dashboard/registro-seleccion" className="text-gray-500 hover:text-blue-500" title="Registro">
            <PlusCircleIcon className="h-6 w-6" />
          </Link>
        )}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto mb-4 text-gray-500 hover:text-blue-500 focus:outline-none"
        title="Cerrar sesión"
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Sidebar;
