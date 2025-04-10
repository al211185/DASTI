// src/components/Dashboard/NuevaCotizacion/modals/ModalTiempos.jsx
import React, { useState } from 'react';

const MOCK_MAQUINAS = [
  { id: 1, nombre: 'CNC', costoHora: 100 },
  { id: 2, nombre: 'Centro de maquinado', costoHora: 150 },
];

const ModalTiempos = ({ onClose, onTiemposSelect }) => {
  const [maquina, setMaquina] = useState('');
  const [horas, setHoras] = useState(1);

  const handleGuardar = (closeAfter = true) => {
    const seleccion = MOCK_MAQUINAS.find((m) => m.nombre === maquina);
    if (seleccion) {
      // Crea el objeto de tiempos para la máquina seleccionada
      const nuevoTiempo = {
        maquina: seleccion.nombre,
        horas,
        costoHora: seleccion.costoHora,
        total: horas * seleccion.costoHora,
      };
      onTiemposSelect(nuevoTiempo);
    }
    if (closeAfter) {
      onClose();
    } else {
      // Reinicia los campos para agregar otra máquina
      setMaquina('');
      setHoras(1);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-md rounded shadow relative">
        <h2 className="text-xl font-semibold mb-2">Agregar Máquina y Horas</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          X
        </button>
        <div className="mb-4">
          <label className="block text-sm mb-1">Máquina</label>
          <select
            className="border rounded p-2 w-full"
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
          >
            <option value="">Seleccione</option>
            {MOCK_MAQUINAS.map((m) => (
              <option key={m.id} value={m.nombre}>
                {m.nombre} - ${m.costoHora}/hr
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Horas</label>
          <input
            type="number"
            className="border rounded p-2 w-full"
            value={horas}
            onChange={(e) => setHoras(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGuardar(false)}
          >
            Guardar y agregar otro
          </button>
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => handleGuardar(true)}
          >
            Terminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTiempos;
