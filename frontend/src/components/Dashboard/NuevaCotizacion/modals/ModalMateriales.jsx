import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const ModalMateriales = ({ onClose, onMaterialSelect }) => {
  const [materialesDB, setMaterialesDB] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Obtén los materiales desde la API al montar el componente
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await axiosInstance.get('/materiales');
        setMaterialesDB(response.data);
      } catch (error) {
        console.error('Error al obtener materiales desde la base de datos:', error);
      }
    };
    fetchMateriales();
  }, []);

  // Construir un arreglo único de categorías usando reduce
  const categoriasUnicas = Object.values(
    materialesDB.reduce((acc, mat) => {
      if (mat.categoria && typeof mat.categoria === 'object' && mat.categoria._id) {
        acc[mat.categoria._id] = mat.categoria;
      }
      return acc;
    }, {})
  );

  // Filtrar materiales según búsqueda o categoría seleccionada
  const materialesFiltrados =
    busqueda.trim() !== ''
      ? materialesDB.filter(mat =>
          mat.nombre.toLowerCase().includes(busqueda.toLowerCase())
        )
      : categoriaSeleccionada
      ? materialesDB.filter(mat =>
          mat.categoria && mat.categoria._id === categoriaSeleccionada
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
          X
        </button>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar material..."
            className="border rounded p-2 w-full"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {/* Si no se está buscando, mostrar el select de categorías */}
        {busqueda.trim() === '' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Seleccionar Categoría
            </label>
            <select
              className="w-full border rounded p-2"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">-- Todas las categorías --</option>
              {categoriasUnicas.map((categoria) => (
                <option key={categoria._id} value={categoria._id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <ul className="max-h-48 overflow-auto border p-2">
          {materialesFiltrados.map((item, i) => (
            <li
              key={i}
              className="p-2 cursor-pointer hover:bg-gray-100 flex justify-between"
              onClick={() => onMaterialSelect(item)}           
            >
              <span>{item.nombre}</span>
              <span className="text-xs text-gray-500">
                {item.categoria && item.categoria.nombre ? item.categoria.nombre : ''}
              </span>
            </li>
          ))}
          {materialesFiltrados.length === 0 && (
            <li className="p-2 text-sm text-gray-500">No se encontraron materiales.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ModalMateriales;
