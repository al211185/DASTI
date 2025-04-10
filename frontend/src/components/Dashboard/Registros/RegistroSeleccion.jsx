//src\components\Dashboard\Registros\RegistroSeleccion.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistroSeleccion = () => {
  const navigate = useNavigate();

  const handleSeleccion = (tipo) => {
    switch (tipo) {
      case 'planta':
        navigate('/dashboard/registro/planta');
        break;
      case 'cliente':
        navigate('/dashboard/registro/cliente');
        break;
      case 'usuario':
        navigate('/dashboard/registro/usuario');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Selecciona el tipo de registro</h1>
      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <button
          onClick={() => handleSeleccion('planta')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Registrar Planta
        </button>
        <button
          onClick={() => handleSeleccion('cliente')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Registrar Cliente
        </button>
        <button
          onClick={() => handleSeleccion('usuario')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Registrar Usuario
        </button>
      </div>
    </div>
  );
};

export default RegistroSeleccion;
