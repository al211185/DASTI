import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegistroMaquina = () => {
  const [nombre, setNombre] = useState('');
  const [costoHora, setCostoHora] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axiosInstance.post('/maquinas', {
        nombre,
        costoHora: parseFloat(costoHora),
      });
      setMensaje(`Máquina "${response.data.nombre}" registrada con éxito.`);
      setNombre('');
      setCostoHora('');
      // Optionally: navigate('/dashboard/maquinas');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar la máquina.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Registrar Nueva Máquina</h2>
      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre de la máquina</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Costo por hora</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={costoHora}
            onChange={(e) => setCostoHora(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        >
          Registrar Máquina
        </button>
      </form>
    </div>
  );
};

export default RegistroMaquina;
