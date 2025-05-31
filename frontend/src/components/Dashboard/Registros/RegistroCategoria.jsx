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
      navigate('/dashboard/registro/categorias');
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
    <div className="min-h-full flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-medium text-accent1 text-center mb-6">
          {id ? 'Editar Categoría' : 'Registrar Categoría'}
        </h2>

        {error   && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {mensaje && <p className="text-green-600 text-sm mb-4">{mensaje}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            disabled={guardando}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={guardando}
            className="w-1/2 h-10 mx-auto block bg-secondary hover:bg-secondary-dark text-white rounded-full text-base font-medium disabled:opacity-50 transition"
          >
            {guardando
              ? id ? 'Guardando cambios…' : 'Registrando…'
              : id ? 'Actualizar' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
