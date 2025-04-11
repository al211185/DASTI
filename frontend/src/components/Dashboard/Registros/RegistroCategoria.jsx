import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegistroCategoria = () => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setNombre(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    try {
      // Envía el nombre de la categoría al endpoint de categorías
      const response = await axiosInstance.post('/categorias', { nombre });
      setMensaje('Categoría registrada correctamente.');
      setNombre('');
      // Opcional: redirige a otra ruta (por ejemplo, a la lista de categorías)
      // navigate('/dashboard/categorias');
    } catch (err) {
      console.error('Error al registrar categoría:', err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Registrar Categoría</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {mensaje && <p className="text-green-500 mb-2">{mensaje}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre de la Categoría
          </label>
          <input
            type="text"
            name="nombre"
            value={nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre"
            className="w-full border rounded p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegistroCategoria;
