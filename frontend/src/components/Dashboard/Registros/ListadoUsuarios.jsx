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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        <button
          onClick={() => navigate('/dashboard/registro/usuario')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Nuevo usuario
        </button>
      </div>

      {usuarios.length === 0 ? (
        <p className="text-gray-500">No hay usuarios registrados.</p>
      ) : (
        <div className="grid gap-4">
          {usuarios.map((u) => (
            <div
              key={u._id}
              className="flex justify-between items-center p-4 border rounded"
            >
              <div>
                <p className="font-medium">{u.nombre}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
                <p className="text-xs text-gray-400">{u.departamento}</p>
                <p className="text-xs text-gray-400">
                  {u.rol?.nombre || u.rol || 'Sin rol'}
                </p>
              </div>

              <div className="space-x-2">
                {/* editar */}
                <button
                  onClick={() => navigate(`/dashboard/registro/usuario/${u._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                {/* eliminar */}
                <button
                  disabled={eliminando === u._id}
                  onClick={() => handleEliminar(u._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {eliminando === u._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
