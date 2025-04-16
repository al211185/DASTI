import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

// Carga la URL base de la API desde la variable de entorno
const API_URL = import.meta.env.VITE_API_URL;

const ModalMateriales = ({ onClose, onMaterialSelect }) => {
  const [materialesDB, setMaterialesDB] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await axiosInstance.get('/materiales');
        setMaterialesDB(response.data);
      } catch (error) {
        console.error('Error al obtener materiales:', error);
      }
    };
    fetchMateriales();
  }, []);

  const categoriasUnicas = Object.values(
    materialesDB.reduce((acc, mat) => {
      if (mat.categoria?._id) acc[mat.categoria._id] = mat.categoria;
      return acc;
    }, {})
  );

  const materialesFiltrados = busqueda
    ? materialesDB.filter(mat =>
        mat.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : categoriaSeleccionada
    ? materialesDB.filter(mat =>
        mat.categoria._id === categoriaSeleccionada
      )
    : materialesDB;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-lg rounded shadow relative">
        <h2 className="text-xl font-semibold mb-2">Seleccionar Material</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <input
          type="text"
          placeholder="Buscar material..."
          className="border rounded p-2 w-full mb-4"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        {!busqueda && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Filtrar por Categoría</label>
            <select
              className="w-full border rounded p-2"
              value={categoriaSeleccionada}
              onChange={e => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">-- Todas --</option>
              {categoriasUnicas.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <ul className="max-h-64 overflow-auto border rounded">
          {materialesFiltrados.map((mat, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onMaterialSelect(mat)}
            >
              <div className="flex items-center space-x-3">
                {mat.imagen ? (
                  <img
                    // OJO: esta URL debe apuntar al backend (puerto 5000)
                    src={`${API_URL}${mat.imagen}`}
                    alt={mat.nombre}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    📦
                  </div>
                )}
                <div>
                  <p className="font-medium">{mat.nombre}</p>
                  <p className="text-xs text-gray-500">{mat.categoria?.nombre}</p>
                </div>
              </div>
            </li>
          ))}
          {materialesFiltrados.length === 0 && (
            <li className="p-2 text-sm text-gray-500">
              No se encontraron materiales.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ModalMateriales;
