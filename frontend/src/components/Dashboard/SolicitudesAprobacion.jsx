// src/components/Dashboard/SolicitudesAprobacion.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const SolicitudesAprobacion = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/cotizaciones/solicitudes')
            .then(res => {
                // sólo dejamos las solicitudes con cotizacionId no nulo
                const validas = res.data.solicitudes.filter(s => s.cotizacionId);
                setSolicitudes(validas);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDecision = (historialId, cotizacionId, aprovado) => {
        // Antes de aprobar un BORRADO, pedimos confirmación
        if (aprovado) {
            const sol = solicitudes.find(s => s._id === historialId);
            if (sol?.action === 'solicitud_delete') {
                const ok = window.confirm(
                    'La cotización se borrará DEFINITIVAMENTE. ¿Estás seguro?'
                );
                if (!ok) return;
            }
        }
        // Ahora aprobamos o rechazamos
        axiosInstance.post(
            `/cotizaciones/${cotizacionId}/solicitudes/${historialId}`,
            { aprovado }
        )
            .then(() => {
                // quitamos la solicitud de la lista
                setSolicitudes(sols =>
                    sols.filter(s => s._id !== historialId)
                );
            })
            .catch(console.error);
    };

    if (loading) return <p>Cargando solicitudes…</p>;

    return (
        <div className="min-h-screen py-8 px-4 md:px-8">
            <div className="max-w-screen-xl mx-auto bg-white border rounded-2xl shadow-lg p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-3xl font-semibold text-gray-800">
                        Solicitudes de Aprobación
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Cotización</th>
                                <th className="p-2 border">Usuario</th>
                                <th className="p-2 border">Acción</th>
                                <th className="p-2 border">Fecha</th>
                                <th className="p-2 border">Decisión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map(s => (
                                <tr key={s._id}>
                                    {/* serial */}
                                    <td className="p-2 border">{s.cotizacionId.serial}</td>

                                    {/* usuario que pidió la solicitud */}
                                    <td className="p-2 border">{s.usuario}</td>

                                    {/* acción */}
                                    <td className="p-2 border">
                                        {s.action === 'solicitud_edit' ? 'Editar' : 'Eliminar'}
                                    </td>

                                    {/* fecha de la solicitud */}
                                    <td className="p-2 border">
                                        {new Date(s.createdAt).toLocaleString()}
                                    </td>

                                    {/* botones */}
                                    <td className="p-2 border flex justify-center items-center space-x-2">
                                        <button
                                            className="px-2 py-1 bg-green-500 text-white rounded"
                                            onClick={() => handleDecision(s._id, s.cotizacionId._id, true)}
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-red-500 text-white rounded"
                                            onClick={() => handleDecision(s._id, s.cotizacionId._id, false)}
                                        >
                                            Rechazar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
  );
};

export default SolicitudesAprobacion;
