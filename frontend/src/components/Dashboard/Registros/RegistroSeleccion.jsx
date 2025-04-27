// src/components/Dashboard/RegistroSeleccion.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';

// Define aquí las entidades que quieres crear y gestionar
const ENTIDADES = [
  { key: 'planta', label: 'Planta', plural: 'plantas' },
  { key: 'cliente', label: 'Cliente', plural: 'clientes' },
  { key: 'usuario', label: 'Usuario', plural: 'usuarios' },
  { key: 'material', label: 'Material', plural: 'materiales' },
  { key: 'categoria', label: 'Categoría', plural: 'categorias' },
  { key: 'proveedor', label: 'Proveedor', plural: 'proveedores' },
  { key: 'maquina', label: 'Máquina', plural: 'maquinas' },
];

const RegistroSeleccion = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const role = user?.rol?.nombre?.toLowerCase();

  // Si es 'almacen' o 'compras', sólo mostramos material, categoría y proveedor
  const entidadesFiltradas = 
    ['almacen', 'compras'].includes(role)
      ? ENTIDADES.filter(e => ['material','categoria','proveedor'].includes(e.key))
      : ENTIDADES;

  const handleCreate = (key) => {
    navigate(`/dashboard/registro/${key}`);
  };

  const handleManage = (plural) => {
    navigate(`/dashboard/registro/${plural}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Administrar Registros</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {entidadesFiltradas.map(({ key, label, plural }) => (
          <div
            key={key}
            className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
          >
            <h2 className="text-xl font-semibold mb-4">{label}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleCreate(key)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
              >
                Registrar {label}
              </button>
              <button
                onClick={() => handleManage(plural)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors"
              >
                Gestionar {plural.charAt(0).toUpperCase() + plural.slice(1)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistroSeleccion;
