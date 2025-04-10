// src/components/Dashboard/NuevaCotizacion/modals/ModalProveedores.jsx
import React from 'react';

const MOCK_PROVEEDORES = [
  { 
    id: 1, 
    elemento: 'Hierro puro', 
    fechaActualizacion: new Date('2023-03-15T10:00:00'),
    proveedor: 'Mapresa', 
    precioUnitario: 50 
  },
  { 
    id: 2, 
    elemento: 'Hierro puro', 
    fechaActualizacion: new Date('2023-03-16T12:00:00'),
    proveedor: 'AcerosMX', 
    precioUnitario: 45 
  },
  { 
    id: 3, 
    elemento: 'Hierro puro', 
    fechaActualizacion: new Date('2023-03-17T14:00:00'),
    proveedor: 'Industrias Steel', 
    precioUnitario: 55 
  },
];

const ModalProveedores = ({ material, onClose, onProveedorSelect }) => {
  // Filtra proveedores según el elemento (si se seleccionó un material, compara con material.nombre)
  const proveedoresFiltrados = material
    ? MOCK_PROVEEDORES.filter((prov) => prov.elemento === material.nombre)
    : MOCK_PROVEEDORES;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-lg rounded shadow relative">
        <h2 className="text-xl font-semibold mb-2">
          Proveedores para {material?.nombre || 'el material'}
        </h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          X
        </button>
        <table className="w-full border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Elemento</th>
              <th className="p-2 border text-left">Fecha Actualización</th>
              <th className="p-2 border text-left">Proveedor</th>
              <th className="p-2 border text-left">Precio</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((prov) => (
              <tr
                key={prov.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onProveedorSelect(prov)}
              >
                <td className="p-2 border">{prov.elemento}</td>
                <td className="p-2 border">
                  {prov.fechaActualizacion.toLocaleDateString()}
                </td>
                <td className="p-2 border">{prov.proveedor}</td>
                <td className="p-2 border">${prov.precioUnitario}</td>
              </tr>
            ))}
            {proveedoresFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" className="p-2 border text-center">
                  No se encontraron proveedores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProveedores;
