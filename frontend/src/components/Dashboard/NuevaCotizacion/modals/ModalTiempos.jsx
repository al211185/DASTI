import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const ModalTiempos = ({ tipo, onClose, onTiemposSelect }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [selectedMaquina, setSelectedMaquina] = useState('');
  const [horas, setHoras] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaquinas = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/maquinas');
        setMaquinas(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaquinas();
  }, []);

  const handleGuardar = (closeAfter = true) => {
    const seleccion = maquinas.find(m => m.nombre === selectedMaquina);
    if (seleccion) {
      const nuevoTiempo = {
        maquina: seleccion.nombre,
        horas,
        costoHora: seleccion.costoHora,
        total: horas * seleccion.costoHora,
        tipo,              // ← lo agregamos aquí
      };
      onTiemposSelect(nuevoTiempo);
    }
    if (closeAfter) onClose();
    else {
      setSelectedMaquina('');
      setHoras(1);
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando máquinas…</div>;
  if (error) return (
    <div className="p-4">
      <p className="text-red-500">Error: {error}</p>
      <button onClick={onClose} className="mt-2 bg-gray-300 px-4 py-2 rounded">Cerrar</button>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-6 w-full max-w-md rounded shadow relative">
        <h2 className="text-xl font-semibold mb-4">
          Agregar Máquina ({tipo === 'producción' ? 'Producción' : 'Diseño'})
        </h2>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>

        <div className="mb-4">
          <label className="block text-sm mb-1">Máquina</label>
          <select
            className="w-full border rounded p-2"
            value={selectedMaquina}
            onChange={e => setSelectedMaquina(e.target.value)}
          >
            <option value="">Seleccione</option>
            {maquinas.map(m => (
              <option key={m._id} value={m.nombre}>
                {m.nombre} — ${m.costoHora}/hr
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Horas</label>
          <input
            type="number"
            min="1"
            className="w-full border rounded p-2"
            value={horas}
            onChange={e => setHoras(+e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGuardar(false)}
          >
            Guardar y agregar otro
          </button>
          <button
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
