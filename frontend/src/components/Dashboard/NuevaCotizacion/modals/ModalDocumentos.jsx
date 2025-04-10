// src/components/Dashboard/NuevaCotizacion/modals/ModalDocumentos.jsx
import React, { useState } from 'react';

const ModalDocumentos = ({ onClose, onDocumentSelect }) => {
  const [files, setFiles] = useState([]);

  // Maneja el cambio del input file, permitiendo seleccionar múltiples archivos
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  // Al confirmar, envía los archivos seleccionados y cierra el modal
  const handleSubmit = () => {
    // Aquí podrías procesar los archivos, subirlos o enviarlos a la API
    onDocumentSelect(files);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-lg rounded shadow relative">
        <h2 className="text-xl font-semibold mb-2">Subir Documentos</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          X
        </button>
        <input
          type="file"
          multiple
          className="border rounded p-2 w-full"
          onChange={handleFileChange}
        />
        {files.length > 0 && (
          <ul className="mt-4 max-h-40 overflow-auto border p-2">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-700">
                {file.name}
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDocumentos;
