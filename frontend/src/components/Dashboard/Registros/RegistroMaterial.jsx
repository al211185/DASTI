import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

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
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? 'Editar Material' : 'Registrar Material'}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del Material
          </label>
          <input
            type="text"
            name="nombre"
            value={material.nombre}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            disabled={submitting}
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            name="categoria"
            value={material.categoria}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            disabled={submitting}
          >
            <option value="">-- Selecciona una categoría --</option>
            {categorias.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium mb-1">Imagen</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            disabled={submitting}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 h-24 object-contain border rounded"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 rounded transition ${
            submitting
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {submitting
            ? isEdit ? 'Actualizando...' : 'Registrando...'
            : isEdit ? 'Actualizar Material' : 'Registrar Material'}
        </button>
      </form>
    </div>
  );
};

export default RegistroMaterial;
