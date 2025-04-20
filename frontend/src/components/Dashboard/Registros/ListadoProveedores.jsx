// src/components/Dashboard/Proveedores/ListadoProveedores.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [eliminando, setEliminando]   = useState(null);
  const navigate = useNavigate();

  // Función para cargar la lista
  const fetchProveedores = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/proveedores');
      setProveedores(res.data);
    } catch (err) {
      console.error('Error al obtener proveedores:', err.response?.data || err.message);
    }
  }, []);

  // Carga inicial y recarga al volver a la pestaña
  useEffect(() => {
    fetchProveedores();
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchProveedores();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchProveedores]);

  // Elimina un proveedor
  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este proveedor?')) return;
    try {
      setEliminando(id);
      await axiosInstance.delete(`/proveedores/${id}`);
      setProveedores(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error al eliminar proveedor:', err.response?.data || err.message);
      alert('No se pudo eliminar. Revisa la consola.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Proveedores</h2>
        <button
          onClick={() => navigate('/dashboard/registro/proveedor')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Nuevo Proveedor
        </button>
      </div>

      {proveedores.length === 0 ? (
        <p className="text-gray-500">No hay proveedores registrados.</p>
      ) : (
        <div className="space-y-4">
          {proveedores.map((prov) => (
            <div
              key={prov._id}
              className="flex justify-between items-center p-4 border rounded shadow-sm"
            >
              <div>
                <p className="font-medium text-lg">{prov.nombre}</p>
                {prov.ciudad && (
                  <p className="text-sm text-gray-500">Ciudad: {prov.ciudad}</p>
                )}
                {prov.contactoNombre && (
                  <p className="text-sm text-gray-500">
                    Contacto: {prov.contactoNombre}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/dashboard/registro/proveedor/${prov._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  disabled={eliminando === prov._id}
                  onClick={() => handleEliminar(prov._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {eliminando === prov._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
