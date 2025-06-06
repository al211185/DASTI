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
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto bg-white border rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Clientes
          </h2>
          <button
            onClick={() => navigate('/dashboard/registro/cliente')}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg shadow transition"
          >
            Nuevo cliente
          </button>
        </div>

        {/* Contenido */}
        {clientes.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No hay clientes registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {clientes.map(c => (
              <div
                key={c._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="text-lg text-gray-700 font-medium">{c.nombre}</p>
                  {c.razonSocial && (
                    <p className="text-sm text-gray-500">{c.razonSocial}</p>
                  )}
                  {c.direccion?.ciudad && (
                    <p className="text-sm text-gray-400">
                      {c.direccion.ciudad}, {c.direccion.estado}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/registro/cliente/${c._id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md transition"
                  >
                    Editar
                  </button>
                  <button
                    disabled={eliminando === c._id}
                    onClick={() => handleEliminar(c._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md disabled:opacity-50 transition"
                  >
                    {eliminando === c._id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
