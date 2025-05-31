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
    <div className="min-h-screen py-8 px-4">
      <div className="w-full bg-white border rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Categorías
          </h2>
          <button
            onClick={() => navigate('/dashboard/registro/categoria')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
          >
            Nueva Categoría
          </button>
        </div>

        {/* Listado */}
        {categorias.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No hay categorías registradas.
          </p>
        ) : (
          <div className="space-y-4">
            {categorias.map((cat) => (
              <div
                key={cat._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <span className="text-lg text-gray-700 font-medium">
                  {cat.nombre}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/registro/categoria/${cat._id}`)
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md transition"
                  >
                    Editar
                  </button>
                  <button
                    disabled={eliminando === cat._id}
                    onClick={() => handleEliminar(cat._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md disabled:opacity-50 transition"
                  >
                    {eliminando === cat._id ? 'Eliminando…' : 'Eliminar'}
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
