// src/components/Dashboard/NuevaCotizacion/modals/ModalMateriales.jsx
import React, { useState } from 'react';

const CATEGORIAS_MATERIALES = [
  { 
    categoria: 'Metales ferrosos', 
    materiales: ['Hierro puro', 'Acero al carbono', 'Acero galvanizado'] 
  },
  { 
    categoria: 'Metales no ferrosos', 
    materiales: ['Aluminio', 'Cobre'] 
  },
  { 
    categoria: 'Plásticos de ingeniería', 
    materiales: ['PVC', 'Policarbonato'] 
  },
];

const ModalMateriales = ({ onClose, onMaterialSelect }) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Si hay busqueda global, se ignora la categoría seleccionada y se buscan en todas las categorías
  const allMaterials = CATEGORIAS_MATERIALES.flatMap(catObj =>
    catObj.materiales.map(mat => ({ nombre: mat, categoria: catObj.categoria }))
  );

  const materialesFiltrados =
    busqueda.trim() !== ''
      ? allMaterials.filter(item =>
          item.nombre.toLowerCase().includes(busqueda.toLowerCase())
        )
      : categoriaSeleccionada
      ? CATEGORIAS_MATERIALES.find(catObj => catObj.categoria === categoriaSeleccionada)?.materiales.map(mat => ({ nombre: mat, categoria: categoriaSeleccionada })) || []
      : [];

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
        {/* Si no se está buscando de forma global, permite seleccionar la categoría */}
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
              <option value="">-- Elige una categoría --</option>
              {CATEGORIAS_MATERIALES.map((catObj, idx) => (
                <option key={idx} value={catObj.categoria}>
                  {catObj.categoria}
                </option>
              ))}
            </select>
          </div>
        )}

        <ul className="max-h-48 overflow-auto border">
          {materialesFiltrados.map((item, i) => (
            <li
              key={i}
              className="p-2 cursor-pointer hover:bg-gray-100 flex justify-between"
              onClick={() =>
                onMaterialSelect({
                  nombre: item.nombre,
                  cantidadSeleccionada: 1,
                  proveedorSeleccionado: null,
                  categoria: item.categoria,
                })
              }
            >
              <span>{item.nombre}</span>
              <span className="text-xs text-gray-500">{item.categoria}</span>
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
