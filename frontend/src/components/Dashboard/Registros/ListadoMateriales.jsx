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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Materiales</h2>

      <div className="grid gap-4">
        {lista.map((m) => (
          <div
            key={m._id}
            className="flex justify-between items-center p-4 border rounded"
          >
            <span>{m.nombre}</span>

            <div className="space-x-2">
              {/* botón editar */}
              <button
                onClick={() => navigate(`/dashboard/registro/material/${m._id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Editar
              </button>

              {/* botón eliminar */}
              <button
                disabled={eliminando === m._id}
                onClick={() => handleEliminar(m._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {eliminando === m._id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
