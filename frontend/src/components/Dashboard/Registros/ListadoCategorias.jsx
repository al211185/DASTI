// src/components/Dashboard/Categorias/ListadoCategorias.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoCategorias() {
  const [categorias, setCategorias]     = useState([]);
  const [eliminando, setEliminando]     = useState(null);
  const navigate = useNavigate();

  // Función para obtener el listado
  const fetchCategorias = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/categorias');
      setCategorias(res.data);
    } catch (err) {
      console.error('Error al obtener categorías:', err.response?.data || err.message);
    }
  }, []);

  // Carga inicial y recarga al volver a la pestaña
  useEffect(() => {
    fetchCategorias();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCategorias();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchCategorias]);

  // Eliminar categoría
  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    try {
      setEliminando(id);
      await axiosInstance.delete(`/categorias/${id}`);
      setCategorias(prev => prev.filter(cat => cat._id !== id));
    } catch (err) {
      console.error('Error al eliminar categoría:', err.response?.data || err.message);
      alert('No se pudo eliminar. Revisa la consola.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Categorías</h2>
        <button
          onClick={() => navigate('/dashboard/registro/categoria')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Nueva Categoría
        </button>
      </div>

      {categorias.length === 0 ? (
        <p className="text-gray-500">No hay categorías registradas.</p>
      ) : (
        <div className="grid gap-4">
          {categorias.map(cat => (
            <div
              key={cat._id}
              className="flex justify-between items-center p-4 border rounded"
            >
              <span className="font-medium">{cat.nombre}</span>
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/dashboard/registro/categoria/${cat._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  disabled={eliminando === cat._id}
                  onClick={() => handleEliminar(cat._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {eliminando === cat._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
