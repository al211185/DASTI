// src/components/Dashboard/NuevaCotizacion/modals/ModalComentarios.jsx
import React, { useState } from 'react';

const ModalComentarios = ({ onClose, onAgregarComentario, comentarios, usuario }) => {
  const [comentario, setComentario] = useState('');

  const handleAgregar = () => {
    if (comentario.trim() !== '') {
      onAgregarComentario(comentario, usuario); // Se usa el nombre completo recibido
      setComentario('');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-md rounded shadow relative">
        <h2 className="text-xl font-semibold mb-2">Comentarios</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          X
        </button>
        <div className="mb-4 max-h-40 overflow-auto border p-2">
          {comentarios && comentarios.length > 0 ? (
            comentarios.map((c, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm">{c.texto}</p>
                <p className="text-xs text-gray-500">
                  {c.usuario} - {new Date(c.fecha).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay comentarios.</p>
          )}
        </div>
        <textarea
          rows="3"
          className="border rounded p-2 w-full mb-4"
          placeholder="Escribe un comentario..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAgregar}>
            Agregar
          </button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalComentarios;
