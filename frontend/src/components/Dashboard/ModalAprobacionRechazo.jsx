// src/components/Dashboard/ModalAprobacionRechazo.jsx
import React, { useState } from 'react';

const ModalAprobacionRechazo = ({ onClose, onSubmit, currentState }) => {
  const [estado, setEstado] = useState(currentState || 'Pendiente de aprobación');
  const [comentario, setComentario] = useState('');

  const handleConfirm = () => {
    onSubmit({ estado, comentario });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-md rounded shadow relative">
        <h2 className="text-xl font-semibold mb-4">Actualizar Estado de Cotización</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          X
        </button>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="Pendiente de aprobación">Pendiente de aprobación</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Comentario</label>
          <textarea
            rows="3"
            className="w-full border rounded p-2"
            placeholder="Agrega un comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleConfirm}
          >
            Confirmar
          </button>
          <button
            type="button"
            className="bg-gray-300 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAprobacionRechazo;
