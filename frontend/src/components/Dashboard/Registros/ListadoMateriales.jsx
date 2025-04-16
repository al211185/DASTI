import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function ListadoMateriales() {
  const [lista, setLista] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get('/materiales');
      setLista(res.data);
    })();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Materiales</h2>
      <div className="grid gap-4">
        {lista.map(m => (
          <div
            key={m._id}
            className="flex justify-between items-center p-4 border rounded"
          >
            <span>{m.nombre}</span>
            <button
              onClick={() => navigate(`/dashboard/registro/material/${m._id}`)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
