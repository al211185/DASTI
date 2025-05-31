import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL; // e.g. "http://localhost:5000"

const RegistroMaterial = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [material, setMaterial] = useState({
    nombre: '',
    categoria: '',
    imagen: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Carga de categorías y lista de materiales para validación
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, matsRes] = await Promise.all([
          axiosInstance.get('/categorias'),
          axiosInstance.get('/materiales'),
        ]);
        setCategorias(catsRes.data);
        setMateriales(matsRes.data);
      } catch (err) {
        console.error('Error al obtener datos:', err);
      }
    };
    fetchData();
  }, []);

  // Si estamos en modo edición, cargar datos del material
  useEffect(() => {
    if (!isEdit) return;

    const fetchMaterial = async () => {
      try {
        const res = await axiosInstance.get(`/materiales/${id}`);
        const mat = res.data;
        setMaterial({
          nombre: mat.nombre,
          categoria: mat.categoria._id,
          imagen: null, // el user puede subir archivo nuevo si lo desea
        });
        setPreviewUrl(`${API_URL}${mat.imagen}`);
      } catch (err) {
        console.error('Error cargando material:', err);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMaterial(prev => ({ ...prev, imagen: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && material.imagen) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, material.imagen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar duplicado (salta si edit y el nombre no cambió)
    const nombreLower = material.nombre.trim().toLowerCase();
    const duplicado = materiales.find(m =>
      m.nombre.trim().toLowerCase() === nombreLower &&
      (!isEdit || m._id !== id)
    );
    if (duplicado) {
      setError('Ya existe otro material con ese nombre.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('nombre', material.nombre.trim());
    formData.append('categoria', material.categoria);
    if (material.imagen) {
      formData.append('imagen', material.imagen);
    }

    try {
      if (isEdit) {
        await axiosInstance.put(`/materiales/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Material actualizado correctamente.');
      } else {
        const res = await axiosInstance.post('/materiales', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMateriales(prev => [...prev, res.data]);
        setSuccess('Material registrado exitosamente.');
      }
      // Limpiar o redirigir tras éxito
      setTimeout(() => navigate('/dashboard/registro/material'), 1500);
    } catch (err) {
      console.error('Error al guardar material:', err);
      setError(err.response?.data?.msg || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-medium text-accent1 text-center mb-6">
          {isEdit ? 'Editar Material' : 'Registrar Material'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <input
            name="nombre"
            type="text"
            placeholder="Nombre del material"
            value={material.nombre}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full h-12 bg-gray-200 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Categoría */}
          <div className="relative">
            <select
              name="categoria"
              value={material.categoria}
              onChange={handleChange}
              required
              disabled={submitting}
              className="appearance-none w-full h-12 bg-gray-200 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Selecciona categoría —</option>
              {categorias.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
              ))}
            </select>
            {/* flecha custom */}
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Imagen */}
          <div className="flex flex-col">
            <label className="block text-sm text-gray-600 mb-2">Imagen (opcional)</label>
              <label
                htmlFor="imagen"
                className="
                  flex items-center justify-center
                  w-full h-12 
                  bg-primary/70 rounded-full
                  cursor-pointer
                  hover:bg-primary hover:text-white
                  transition
                "
              >
                <span className="text-white">Seleccionar archivo</span>
              </label>
              <input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={submitting}
                className="hidden"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-3 w-full h-32 object-contain border border-accent3 rounded-lg"
                />
              )}
            </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full h-12 bg-secondary text-white rounded-full text-base font-medium hover:bg-secondary-dark disabled:opacity-50 transition`}
          >
            {submitting
              ? isEdit ? 'Actualizando…' : 'Registrando…'
              : isEdit ? 'Actualizar Material' : 'Registrar Material'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroMaterial;
