// src/components/Dashboard/Plantas/RegistroPlanta.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function RegistroPlanta() {
  const { id } = useParams();          // ← viene cuando editas
  const navigate = useNavigate();

  const [planta, setPlanta] = useState({
    nombre: '',
    ubicacion: '',
    responsable: '',
    // cliente: '',                    // opcional: si tu planta pertenece a un cliente
  });
  const [guardando, setGuardando] = useState(false);

  /* -------------------------- cargar planta (edit) ------------------------- */
  useEffect(() => {
    if (!id) return;                   // modo creación
    (async () => {
      try {
        const res = await axiosInstance.get(`/plantas/${id}`);
        setPlanta(res.data);
      } catch (err) {
        console.error('Error al obtener planta:', err.response?.data || err.message);
        alert('No se pudo cargar la planta');
        navigate(-1);
      }
    })();
  }, [id, navigate]);

  /* ------------------------------ handlers --------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanta((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      if (id) {
        await axiosInstance.put(`/plantas/${id}`, planta);
      } else {
        await axiosInstance.post('/plantas', planta);
      }
      navigate('/dashboard/registro/plantas');  // ajusta tu ruta de listado
    } catch (err) {
      console.error('Error al guardar planta:', err.response?.data || err.message);
      alert('No se pudo guardar. Revisa la consola.');
    } finally {
      setGuardando(false);
    }
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="min-h-full flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-medium text-accent1 text-center mb-6">
          {id ? 'Editar Planta' : 'Registrar Planta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={planta.nombre}
            onChange={handleChange}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <input
            type="text"
            name="ubicacion"
            placeholder="Ubicación"
            value={planta.ubicacion}
            onChange={handleChange}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <input
            type="text"
            name="responsable"
            placeholder="Responsable"
            value={planta.responsable}
            onChange={handleChange}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={guardando}
            className="w-full h-12 mx-auto block px-6 bg-secondary hover:bg-secondary-dark text-white rounded-full text-base font-medium hover:bg-secondary-dark disabled:opacity-50 transition"
          >
            {guardando ? 'Guardando…' : id ? 'Actualizar Planta' : 'Registrar Planta'}
          </button>
        </form>
      </div>
    </div>
  );
}
