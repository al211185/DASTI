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
      navigate('/dashboard/registro/maquinas');
    } catch (err) {
      console.error('Error al guardar máquina:', err);
      setError(err.response?.data?.msg || 'Error al guardar la máquina.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-full flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-medium text-accent1 text-center mb-6">
          {id ? 'Editar Máquina' : 'Registrar Nueva Máquina'}
        </h2>

        {mensaje && <p className="text-green-600 text-sm mb-4">{mensaje}</p>}
        {error   && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre de la máquina"
            value={maquina.nombre}
            onChange={handleChange}
            required
            disabled={guardando}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            name="costoHora"
            type="number"
            min="0"
            step="0.01"
            placeholder="Costo por hora"
            value={maquina.costoHora}
            onChange={handleChange}
            required
            disabled={guardando}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={guardando}
            className="w-1/2 h-10 mx-auto block bg-secondary hover:bg-secondary-dark text-white rounded-full text-base font-medium disabled:opacity-50 transition"
          >
            {guardando ? 'Guardando…' : id ? 'Actualizar' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  );
}