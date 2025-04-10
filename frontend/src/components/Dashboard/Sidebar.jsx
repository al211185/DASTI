import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, DocumentPlusIcon, ArrowLeftOnRectangleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
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

  // Comprobación del rol: se revisa user.rol.nombre, ya que así se estructura el objeto usuario en tu context.
  const mostrarRegistro =
    user && user.rol && (user.rol.nombre === 'Director' || user.rol.nombre === 'Administrador');

  return (
    <div className="w-20 flex flex-col items-center bg-white border-r h-screen">
      <div className="mt-4 mb-6">
        <img src="/logo.png" alt="DASTI-CORP" className="h-8 mx-auto" />
      </div>
      <nav className="flex flex-col space-y-4">
        <Link to="/dashboard" className="text-gray-500 hover:text-blue-500" title="Inicio">
          <HomeIcon className="h-6 w-6" />
        </Link>
        <Link to="/dashboard/nueva-cotizacion" className="text-gray-500 hover:text-blue-500" title="Nueva cotización">
          <DocumentPlusIcon className="h-6 w-6" />
        </Link>
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
