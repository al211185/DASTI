import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const ModalTiempos = ({ onClose, onTiemposSelect }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [selectedMaquina, setSelectedMaquina] = useState('');
  const [horas, setHoras] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtén las máquinas desde la API
  useEffect(() => {
    const fetchMaquinas = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/maquinas');
        setMaquinas(res.data);
      } catch (err) {
        console.error('Error al obtener máquinas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaquinas();
  }, []);

  const handleGuardar = (closeAfter = true) => {
    // Encuentra la máquina seleccionada en el array
    const seleccion = maquinas.find(m => m.nombre === selectedMaquina);
    if (seleccion) {
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
      setSelectedMaquina('');
      setHoras(1);
    }
  };

  if (loading) return <div className="text-center p-4">Cargando máquinas...</div>;
  if (error) return (
    <div className="p-4">
      <p className="text-red-500">Error: {error}</p>
      <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cerrar</button>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 w-full max-w-md rounded shadow relative">
        <h2 className="text-xl font-semibold mb-2">Agregar Máquina y Horas</h2>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">X</button>
        <div className="mb-4">
          <label className="block text-sm mb-1">Máquina</label>
          <select
            className="border rounded p-2 w-full"
            value={selectedMaquina}
            onChange={(e) => setSelectedMaquina(e.target.value)}
          >
            <option value="">Seleccione</option>
            {maquinas.map(m => (
              <option key={m._id} value={m.nombre}>
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
