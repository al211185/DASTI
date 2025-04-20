// src/components/Dashboard/Maquinas/RegistroMaquina.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

export default function RegistroMaquina() {
  const { id } = useParams();            // si hay id → modo edición
  const navigate = useNavigate();

  const [maquina, setMaquina] = useState({
    nombre: '',
    costoHora: ''
  });
  const [mensaje, setMensaje]   = useState('');
  const [error, setError]       = useState('');
  const [guardando, setGuardando] = useState(false);

  // Carga datos si es edición
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axiosInstance.get(`/maquinas/${id}`);
        setMaquina({
          nombre: res.data.nombre,
          costoHora: res.data.costoHora.toString()
        });
      } catch (err) {
        console.error('Error al cargar máquina:', err);
        alert('No se pudo cargar la máquina');
        navigate(-1);
      }
    })();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaquina(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setGuardando(true);

    try {
      const payload = {
        nombre: maquina.nombre,
        costoHora: parseFloat(maquina.costoHora)
      };

      if (id) {
        await axiosInstance.put(`/maquinas/${id}`, payload);
        setMensaje('Máquina actualizada correctamente.');
      } else {
        const res = await axiosInstance.post('/maquinas', payload);
        setMensaje(`Máquina "${res.data.nombre}" registrada con éxito.`);
        setMaquina({ nombre: '', costoHora: '' });
      }

      // redirigir opcional
      // navigate('/dashboard/maquinas');
    } catch (err) {
      console.error('Error al guardar máquina:', err);
      setError(err.response?.data?.msg || 'Error al guardar la máquina.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">
        {id ? 'Editar Máquina' : 'Registrar Nueva Máquina'}
      </h2>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error   && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre de la máquina</label>
          <input
            type="text"
            name="nombre"
            value={maquina.nombre}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            disabled={guardando}
          />
        </div>
        <div>
          <label className="block mb-1">Costo por hora</label>
          <input
            type="number"
            name="costoHora"
            min="0"
            step="0.01"
            value={maquina.costoHora}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            disabled={guardando}
          />
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {guardando
            ? 'Guardando…'
            : id
              ? 'Actualizar Máquina'
              : 'Registrar Máquina'}
        </button>
      </form>
    </div>
  );
}
