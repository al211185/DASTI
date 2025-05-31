// src/components/Dashboard/RegistroSeleccion.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ENTIDADES = [
  { key: 'planta',    label: 'Planta',    plural: 'plantas' },
  { key: 'cliente',   label: 'Cliente',   plural: 'clientes' },
  { key: 'usuario',   label: 'Usuario',   plural: 'usuarios' },
  { key: 'material',  label: 'Material',  plural: 'materiales' },
  { key: 'categoria', label: 'Categoría', plural: 'categorias' },
  { key: 'proveedor', label: 'Proveedor', plural: 'proveedores' },
  { key: 'contactos', label: 'Contactos', plural: 'contactos-proveedores' },
  { key: 'maquina',   label: 'Máquina',   plural: 'maquinas' },
];

const RegistroSeleccion = () => {
  const navigate = useNavigate();

  const handleCreate = (key) => {
    // Si la entidad es 'contactos', redirigimos directamente al listado de contactos
    if (key === 'contactos') {
      navigate(`/dashboard/registro/contactos`);
    } else {
      navigate(`/dashboard/registro/${key}`);
    }
  };

  const handleManage = (plural) => {
    // Para 'contactos-proveedores', apuntamos a la misma ruta de listado de contactos
    if (plural === 'contactos-proveedores') {
      navigate(`/dashboard/registro/contactos`);
    } else {
      navigate(`/dashboard/registro/${plural}`);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Contenedor principal */}
      <div className="max-w-5xl mx-auto">
        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Administrar Registros
        </h1>

        {/* Grid de tarjetas */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ENTIDADES.map(({ key, label, plural }) => (
            <div
              key={key}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
            >
              <div>
                {/* Iconito opcional */}
                <div className="h-12 w-12 mb-4 flex items-center justify-center bg-blue-50 rounded-full">
                  {/* Aquí podrías inyectar un icono SVG según la entidad */}
                  <span className="text-blue-500 font-bold">{label.charAt(0)}</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-700">
                  {label}
                </h2>
                <p className="mt-2 text-gray-500">
                  Crea o administra tus {plural}.
                </p>
              </div>

              {/* Botones */}
              <div className="mt-6 flex space-x-3">
                {key === 'contactos' ? (
                  <>
                    <button
                      onClick={() => handleCreate(key)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                    >
                      Ver Contactos
                    </button>
                    <button
                      onClick={() => handleManage(plural)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-secondary hover:bg-secondary-dark text-white font-medium rounded-lg transition-colors"
                    >
                      Ir a Contactos
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleCreate(key)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                    >
                      Registrar
                    </button>
                    <button
                      onClick={() => handleManage(plural)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-secondary hover:bg-secondary-dark text-white font-medium rounded-lg transition-colors"
                    >
                      Gestionar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegistroSeleccion;
