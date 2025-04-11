import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const ModalProveedores = ({ material, onClose, onProveedorSelect }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProveedores = async () => {
      if (!material || !material._id) {
        // Si no se ha definido un material, no se realiza la consulta.
        setProveedores([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const query = `?material=${encodeURIComponent(material._id)}`;
        const response = await axiosInstance.get('/proveedores' + query);
        setProveedores(response.data);
      } catch (err) {
        console.error('Error al obtener proveedores:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProveedores();
  }, [material]);
  

  if (loading) {
    return <div className="text-center p-4">Cargando proveedores...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error: {error}</p>
        <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cerrar</button>
      </div>
    );
  }

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
              <th className="p-2 border text-left">Material</th>
              <th className="p-2 border text-left">Proveedor</th>
              <th className="p-2 border text-left">Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((prov) => {
              // Encuentra la oferta para el material seleccionado
              const oferta = prov.materiales.find((m) => 
                m.material && m.material._id && m.material._id.toString() === material._id.toString()
              );
              return (
                <tr
                  key={prov._id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    onProveedorSelect({ proveedor: prov, oferta })
                  }
                >
                  <td className="p-2 border">{material.nombre}</td>
                  <td className="p-2 border">{prov.nombre}</td>
                  <td className="p-2 border">
                    {oferta ? `$${oferta.precioUnitario}` : 'N/A'}
                  </td>
                </tr>
              );
            })}
            {proveedores.length === 0 && (
              <tr>
                <td colSpan="3" className="p-2 border text-center">
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
