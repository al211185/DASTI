import React from 'react';
import { useNavigate } from 'react-router-dom';

const CotizacionesTable = ({
  cotizaciones,
  onOpenModalAprobacion,
  onDuplicar,
  onEliminarCotizacion, // Recibimos esta función del padre
}) => {
  const navigate = useNavigate();

  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Cliente</th>
          <th className="p-2 border">Fecha de inicio</th>
          <th className="p-2 border">Planta</th>
          <th className="p-2 border">Serial</th>
          <th className="p-2 border">Total</th>
          <th className="p-2 border">Estado</th>
          <th className="p-2 border">A/R</th>
          <th className="p-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {cotizaciones.map((cot) => (
          <tr key={cot._id}>
            <td className="p-2 border">
              {cot.cliente && cot.cliente.nombre ? cot.cliente.nombre : 'Sin Cliente'}
            </td>
            <td className="p-2 border">
              {new Date(cot.fechaInicio).toLocaleDateString()}
            </td>
            <td className="p-2 border">
              {cot.planta && cot.planta.nombre ? cot.planta.nombre : 'Sin Planta'}
            </td>
            <td className="p-2 border">{cot.serial}</td>
            <td className="p-2 border">${cot.total.toFixed(2)}</td>
            <td className="p-2 border">{cot.estado}</td>

            {/* Aprobación/Rechazo */}
            <td className="p-2 border text-center">
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                title="Aprobar o Rechazar"
                onClick={() =>
                  onOpenModalAprobacion({ cotizacionId: cot._id, currentState: cot.estado })
                }
              >
                A/R
              </button>
            </td>

            {/* Acciones */}
            <td className="p-2 border text-center">
              {/* VER */}
              <button
                className="bg-cyan-500 text-white px-2 py-1 rounded mr-2"
                title="Ver Cotización"
                onClick={() => navigate(`/dashboard/cotizacion/${cot._id}`)}
              >
                Ver
              </button>

              {/* EDITAR */}
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                title="Editar"
                onClick={() => navigate(`/dashboard/editar-cotizacion/${cot._id}`)}
              >
                Editar
              </button>

              {/* HISTORIAL */}
              <button
                className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                title="Ver Historial"
                onClick={() => navigate(`/dashboard/cotizacion/${cot._id}/historial`)}
              >
                Hist
              </button>

              {/* DUPLICAR */}
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                title="Duplicar Cotización"
                onClick={() => onDuplicar(cot._id)}
              >
                Dup
              </button>

              {/* ELIMINAR */}
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                title="Eliminar Cotización"
                onClick={() => onEliminarCotizacion(cot._id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CotizacionesTable;
