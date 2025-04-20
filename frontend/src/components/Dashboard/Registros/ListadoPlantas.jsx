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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Plantas</h2>

        {/* botón crear */}
        <button
          onClick={() => navigate('/dashboard/registro/planta')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Nueva planta
        </button>
      </div>

      <div className="grid gap-4">
        {plantas.length === 0 && (
          <p className="text-gray-500">No hay plantas registradas.</p>
        )}

        {plantas.map((p) => (
          <div
            key={p._id}
            className="flex justify-between items-center p-4 border rounded"
          >
            <span>{p.nombre}</span>

            <div className="space-x-2">
              {/* botón editar */}
              <button
                onClick={() => navigate(`/dashboard/registro/planta/${p._id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Editar
              </button>

              {/* botón eliminar */}
              <button
                disabled={eliminando === p._id}
                onClick={() => handleEliminar(p._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {eliminando === p._id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
