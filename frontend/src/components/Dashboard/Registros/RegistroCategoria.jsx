// src/components/Dashboard/Categorias/RegistroCategoria.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function RegistroCategoria() {
  const { id } = useParams();             // id de la categoría si estamos editando
  const navigate = useNavigate();

  const [nombre, setNombre]       = useState('');
  const [error, setError]         = useState(null);
  const [mensaje, setMensaje]     = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Si hay id, cargamos la categoría para editar
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axiosInstance.get(`/categorias/${id}`);
        setNombre(res.data.nombre);
      } catch (err) {
        console.error('Error al cargar categoría:', err);
        alert('No se pudo cargar la categoría');
        navigate(-1);
      }
    })();
  }, [id, navigate]);

  const handleChange = (e) => {
    setNombre(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);

    try {
      if (id) {
        await axiosInstance.put(`/categorias/${id}`, { nombre });
        setMensaje('Categoría actualizada correctamente.');
      } else {
        await axiosInstance.post('/categorias', { nombre });
        setMensaje('Categoría registrada correctamente.');
        setNombre('');
      }
      // Opcional: redirigir a la lista tras unos segundos
      // setTimeout(() => navigate('/dashboard/categorias'), 1000);
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError(err.response?.data?.msg || err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">
        {id ? 'Editar Categoría' : 'Registrar Categoría'}
      </h2>

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
            disabled={guardando}
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {guardando
            ? (id ? 'Guardando cambios…' : 'Registrando…')
            : (id ? 'Actualizar Categoría' : 'Registrar Categoría')}
        </button>
      </form>
    </div>
  );
}
