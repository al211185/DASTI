// src/components/Dashboard/Plantas/ListadoPlantas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoPlantas() {
  const [plantas, setPlantas]   = useState([]);
  const [eliminando, setEliminando] = useState(null);
  const navigate = useNavigate();

  /* ---------------- función para traer datos y reutilizarla --------------- */
  const fetchPlantas = useCallback(async () => {
    const res = await axiosInstance.get('/plantas');
    setPlantas(res.data);
  }, []);

  /* --------------------------- cargar al montar --------------------------- */
  useEffect(() => {
    fetchPlantas();
  }, [fetchPlantas]);

  /* ------------- recargar si vuelves al tab después de editar ------------- */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchPlantas();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchPlantas]);

  /* -------------------------- eliminar planta --------------------------- */
  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta planta?')) return;
    try {
      setEliminando(id);
      await axiosInstance.delete(`/plantas/${id}`);
      setPlantas((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Error al eliminar planta:', err.response?.data || err.message);
      alert('No se pudo eliminar. Revisa la consola.');
    } finally {
      setEliminando(null);
    }
  };

  /* -------------------------------- render ------------------------------ */
  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto bg-white border rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Plantas
          </h2>
          <button
            onClick={() => navigate('/dashboard/registro/planta')}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg shadow transition"
          >
            Nueva planta
          </button>
        </div>

        {/* Listado */}
        {plantas.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No hay plantas registradas.
          </p>
        ) : (
          <div className="space-y-4">
            {plantas.map(p => (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <span className="text-lg text-gray-700 font-medium">
                  {p.nombre}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/registro/planta/${p._id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md transition"
                  >
                    Editar
                  </button>
                  <button
                    disabled={eliminando === p._id}
                    onClick={() => handleEliminar(p._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md disabled:opacity-50 transition"
                  >
                    {eliminando === p._id ? 'Eliminando…' : 'Eliminar'}
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