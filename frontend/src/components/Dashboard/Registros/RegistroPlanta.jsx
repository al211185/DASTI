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
      navigate('/dashboard/plantas');  // ajusta tu ruta de listado
    } catch (err) {
      console.error('Error al guardar planta:', err.response?.data || err.message);
      alert('No se pudo guardar. Revisa la consola.');
    } finally {
      setGuardando(false);
    }
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {id ? 'Editar Planta' : 'Registrar Planta'}
      </h2>

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

        {/* ------------- select cliente (opcional) -------------
        <select
          name="cliente"
          value={planta.cliente}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">— Cliente —</option>
          {clientes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nombre}
            </option>
          ))}
        </select>
        ------------------------------------------------------ */}

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : id ? 'Actualizar Planta' : 'Registrar Planta'}
        </button>
      </form>
    </div>
  );
}
