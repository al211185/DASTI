// src/components/Dashboard/Clientes/ListadoClientes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoClientes() {
  const [clientes, setClientes]   = useState([]);
  const [eliminando, setEliminando] = useState(null);   // id que se está borrando
  const navigate = useNavigate();

  /* --------------- util para cargar la lista (reutilizable) --------------- */
  const fetchClientes = useCallback(async () => {
    const res = await axiosInstance.get('/clientes');
    setClientes(res.data);
  }, []);

  /* --------------------------- cargar al montar --------------------------- */
  useEffect(() => {
    fetchClientes();

    // recargar al volver a la pestaña (ej. después de crear / editar)
    const onVisibility = () => document.visibilityState === 'visible' && fetchClientes();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchClientes]);

  /* ----------------------------- eliminar --------------------------------- */
  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      setEliminando(id);
      await axiosInstance.delete(`/clientes/${id}`);
      setClientes((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Error al eliminar cliente:', err.response?.data || err.message);
      alert('No se pudo eliminar. Revisa la consola.');
    } finally {
      setEliminando(null);
    }
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/dashboard/registro/cliente')}
        >
          Nuevo cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <p className="text-gray-500">No hay clientes registrados.</p>
      ) : (
        <div className="grid gap-4">
          {clientes.map((c) => (
            <div
              key={c._id}
              className="flex justify-between items-center p-4 border rounded"
            >
              <div>
                <p className="font-medium">{c.nombre}</p>
                {c.razonSocial && (
                  <p className="text-xs text-gray-500">{c.razonSocial}</p>
                )}
                {c.direccion?.ciudad && (
                  <p className="text-xs text-gray-400">
                    {c.direccion.ciudad}, {c.direccion.estado}
                  </p>
                )}
              </div>

              <div className="space-x-2">
                {/* editar */}
                <button
                  onClick={() => navigate(`/dashboard/registro/cliente/${c._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                {/* eliminar */}
                <button
                  disabled={eliminando === c._id}
                  onClick={() => handleEliminar(c._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {eliminando === c._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
