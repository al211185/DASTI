import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegistroPlanta = () => {
  const [planta, setPlanta] = useState({
    nombre: '',
    ubicacion: '',
    responsable: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanta({ ...planta, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/plantas', planta);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al registrar planta:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrar Planta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={planta.nombre}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="text"
          name="ubicacion"
          placeholder="Ubicación"
          value={planta.ubicacion}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="text"
          name="responsable"
          placeholder="Responsable"
          value={planta.responsable}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Registrar Planta
        </button>
      </form>
    </div>
  );
};

export default RegistroPlanta;
