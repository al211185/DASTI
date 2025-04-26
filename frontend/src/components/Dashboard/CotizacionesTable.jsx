// src/components/Dashboard/CotizacionesTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CotizacionesTable = ({
  cotizaciones,
  userRole,            // 'vendedores' | 'administrador' | 'director' | 'jefe_produccion'
  onOpenModalAprobacion,
  onDuplicar,
  onVerCotizacion,
  onEliminarCotizacion,
}) => {
  const navigate = useNavigate();

  const isVendor      = userRole === 'vendedores';
  const isAdmin       = userRole === 'administrador';
  const isDirector    = userRole === 'director';
  const isJefeProd    = userRole === 'jefe de produccion';

  const canApprove    = isAdmin || isDirector;
  const canEdit       = isVendor || isAdmin || isDirector || isJefeProd;
  const canDelete     = isVendor || isAdmin || isDirector
  const canDuplicate  = isVendor || isAdmin || isDirector

  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Cliente</th>
          <th className="p-2 border">Fecha</th>
          <th className="p-2 border">Planta</th>
          <th className="p-2 border">Serial</th>
          <th className="p-2 border">Total</th>
          <th className="p-2 border">Estado</th>
          {canApprove && <th className="p-2 border">A/R</th>}
          <th className="p-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {cotizaciones.map(cot => (
          <tr key={cot._id}>
            <td className="p-2 border">{cot.cliente?.nombre || '—'}</td>
            <td className="p-2 border">{new Date(cot.fechaInicio).toLocaleDateString()}</td>
            <td className="p-2 border">{cot.planta?.nombre || '—'}</td>
            <td className="p-2 border">{cot.serial}</td>
            <td className="p-2 border">${cot.total.toFixed(2)}</td>
            <td className="p-2 border">{cot.estado}</td>

            {canApprove && (
              <td className="p-2 border text-center">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => onOpenModalAprobacion({
                    cotizacionId: cot._id,
                    currentState: cot.estado,
                    action: 'approve'
                  })}
                >
                  A/R
                </button>
              </td>
            )}

            <td className="p-2 border text-center space-x-1">
              {/* VER siempre */}
              <button
                className="bg-cyan-500 text-white px-2 py-1 rounded"
                onClick={() => onVerCotizacion(cot._id)}
              >
                Ver
              </button>

              {/* EDITAR: vendedores, admin, director y jefe de producción */}
              {canEdit && (
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => onOpenModalAprobacion({
                    cotizacionId: cot._id,
                    currentState: cot.estado,
                    action: 'edit'
                  })}
                >
                  Editar
                </button>
              )}

              {/* HISTORIAL siempre */}
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => navigate(`/dashboard/cotizacion/${cot._id}/historial`)}
              >
                Hist
              </button>

              {/* DUPLICAR sólo admin/director */}
              {canDuplicate && (
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => onDuplicar(cot._id)}
                >
                  Dup
                </button>
              )}

              {/* ELIMINAR sólo admin/director */}
              {canDelete && (
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => onEliminarCotizacion(cot._id)}
                >
                  Eliminar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CotizacionesTable;
