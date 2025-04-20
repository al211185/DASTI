// src/components/Dashboard/Maquinas/ListadoMaquinas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoMaquinas() {
  const [maquinas, setMaquinas]   = useState([]);
  const [eliminando, setEliminando] = useState(null);
  const navigate = useNavigate();

  // Función para cargar la lista de máquinas
  const fetchMaquinas = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/maquinas');
      setMaquinas(res.data);
    } catch (err) {
      console.error('Error al obtener máquinas:', err.response?.data || err.message);
    }
  }, []);

  // Carga inicial y recarga al volver a la pestaña
  useEffect(() => {
    fetchMaquinas();
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        fetchMaquinas();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchMaquinas]);

  // Función para eliminar una máquina
  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta máquina?')) return;
    try {
      setEliminando(id);
      await axiosInstance.delete(`/maquinas/${id}`);
      setMaquinas(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error('Error al eliminar máquina:', err.response?.data || err.message);
      alert('No se pudo eliminar. Revisa la consola.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Máquinas</h2>
        <button
          onClick={() => navigate('/dashboard/registro/maquina')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Nueva Máquina
        </button>
      </div>

      {maquinas.length === 0 ? (
        <p className="text-gray-500">No hay máquinas registradas.</p>
      ) : (
        <div className="space-y-4">
          {maquinas.map((maq) => (
            <div
              key={maq._id}
              className="flex justify-between items-center p-4 border rounded shadow-sm"
            >
              <div>
                <p className="font-medium text-lg">{maq.nombre}</p>
                <p className="text-sm text-gray-500">
                  Costo/hora: ${maq.costoHora.toFixed(2)}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/dashboard/registro/maquina/${maq._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  disabled={eliminando === maq._id}
                  onClick={() => handleEliminar(maq._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {eliminando === maq._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
