// src/components/Dashboard/Materiales/ListadoMateriales.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoMateriales() {
  const [lista, setLista] = useState([]);
  const [eliminando, setEliminando] = useState(null); // id del material que se está borrando
  const navigate = useNavigate();

  /* --------------------------- cargar materiales --------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosInstance.get('/materiales');
      setLista(res.data);
    };
    fetchData();
  }, []);

  /* ------------------------- eliminar un material ------------------------- */
  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este material?')) return;

    try {
      setEliminando(id);
      await axiosInstance.delete(`/materiales/${id}`);
      // actualiza estado local
      setLista((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Error al eliminar material:', err.response?.data || err.message);
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
            Materiales
          </h2>
          <button
            onClick={() => navigate('/dashboard/registro/material')}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg shadow transition"
          >
            Nuevo Material
          </button>
        </div>

        {/* Listado */}
        {lista.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No hay materiales registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {lista.map(m => (
              <div
                key={m._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <span className="text-lg text-gray-700 font-medium">
                  {m.nombre}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/registro/material/${m._id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md transition"
                  >
                    Editar
                  </button>
                  <button
                    disabled={eliminando === m._id}
                    onClick={() => handleEliminar(m._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md disabled:opacity-50 transition"
                  >
                    {eliminando === m._id ? 'Eliminando…' : 'Eliminar'}
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