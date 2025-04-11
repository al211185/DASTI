import React, { useState } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const ModalDocumentos = ({ existingDocuments, onClose, onDocumentSelect }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Maneja el cambio del input file, permitiendo seleccionar múltiples archivos
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  // Función para subir los archivos al servidor
  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('documents', file);
      });
      const response = await axiosInstance.post('/upload/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Se espera que la respuesta tenga una propiedad "documents" con la info procesada
      return response.data.documents; 
    } catch (err) {
      console.error('Error al subir documentos:', err);
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Al confirmar, sube los archivos y devuelve la lista completa (subidos previamente + nuevos) al callback
  const handleSubmit = async () => {
    const uploadedDocuments = await handleUpload();
    // Si se subieron nuevos archivos, combinarlos con los existentes (o reemplazarlos, según tu lógica)
    const updatedDocuments = uploadedDocuments
      ? [...(existingDocuments || []), ...uploadedDocuments]
      : existingDocuments || [];
    onDocumentSelect(updatedDocuments);
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
        {/* Si existen documentos ya subidos, mostrarlos */}
        {existingDocuments && existingDocuments.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold">Documentos subidos:</h3>
            <ul className="max-h-40 overflow-auto border p-2">
              {existingDocuments.map((doc, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.originalName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Input para seleccionar nuevos archivos */}
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
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {uploading ? 'Subiendo...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
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
