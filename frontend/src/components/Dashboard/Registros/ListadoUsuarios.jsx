// src/components/Dashboard/Usuarios/ListadoUsuarios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [eliminando, setEliminando] = useState(null);
  const navigate = useNavigate();

  // Función para obtener la lista de usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/user');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err.response?.data || err.message);
    }
  }, []);

  // Cargar al montar y al volver a la pestaña
  useEffect(() => {
    fetchUsuarios();
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchUsuarios();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchUsuarios]);

  // Eliminar usuario
  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      setEliminando(id);
      await axiosInstance.delete(`/user/${id}`);
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error('Error al eliminar usuario:', err.response?.data || err.message);
      alert('No se pudo eliminar. Revisa la consola.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto bg-white border rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Usuarios
          </h2>
          <button
            onClick={() => navigate('/dashboard/registro/usuario')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow transition"
          >
            Nuevo usuario
          </button>
        </div>

        {/* Listado */}
        {usuarios.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {usuarios.map(u => (
              <div
                key={u._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="text-lg text-gray-700 font-medium">{u.nombre}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="text-sm text-gray-400">{u.departamento}</p>
                  <p className="text-sm text-gray-400">
                    {u.rol?.nombre || u.rol || 'Sin rol'}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/registro/usuario/${u._id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md transition"
                  >
                    Editar
                  </button>
                  <button
                    disabled={eliminando === u._id}
                    onClick={() => handleEliminar(u._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md disabled:opacity-50 transition"
                  >
                    {eliminando === u._id ? 'Eliminando…' : 'Eliminar'}
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