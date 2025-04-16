// src/components/Dashboard/VerCotizacion.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const VerCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pdfRef = useRef();

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await axiosInstance.get(`/cotizaciones/${id}`);
        setCotizacion(res.data.cotizacion);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al obtener la cotización');
      } finally {
        setLoading(false);
      }
    };
    fetchCotizacion();
  }, [id]);

  const handleGeneratePDF = () => {
    const input = pdfRef.current;
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`cotizacion_${cotizacion.serial}.pdf`);
    });
  };

  if (loading) return <p className="p-4">Cargando cotización...</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;
  if (!cotizacion) return <p className="p-4">Cotización no encontrada.</p>;

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleGeneratePDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Descargar PDF
        </button>
      </div>

      <div ref={pdfRef} className="font-sans text-sm">
        {/* Header azul */}
        <div className="bg-blue-800 text-white p-6 flex justify-between items-center">
          <div>
            <img
              src="/logo.png"
              alt="Tu Logo"
              className="h-12 mb-2"
              crossOrigin="anonymous"
            />
            <div>Calle cualquiera 123</div>
            <div>Cualquier lugar, CP: 12345</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              COTIZACIÓN #{cotizacion.serial.split('-').pop()}
            </div>
            <div>
              <strong>Fecha:</strong>{' '}
              {new Date(cotizacion.fechaInicio).toLocaleDateString()}
            </div>
            <div>
              <strong>Vendedor:</strong> {cotizacion.vendedor?.nombre}
            </div>
            <div>
              <strong>Cliente:</strong> {cotizacion.cliente?.nombre}
            </div>
          </div>
        </div>

        {/* Tabla de renglones */}
        <table className="w-full border-collapse mt-6">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Cantidad</th>
              <th className="p-2 border">%</th>
              <th className="p-2 border">Costo</th>
              <th className="p-2 border">Material</th>
              <th className="p-2 border">Tiempos</th>
              <th className="p-2 border">Comentarios</th>
              <th className="p-2 border">Documentos</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.renglones.map((r, i) => (
              <tr key={i}>
                <td className="p-2 border">{r.descripcion}</td>
                <td className="p-2 border text-center">{r.cantidad}</td>
                <td className="p-2 border text-center">{r.porcentaje}%</td>
                <td className="p-2 border text-right">
                  ${(r.costo || 0).toFixed(2)}
                </td>
                <td className="p-2 border">
                  {Array.isArray(r.material) && r.material.length > 0
                    ? r.material.map((m, j) => (
                        <div key={j}>
                          {m.nombre}
                          {m.proveedorSeleccionado
                            ? `: $${m.proveedorSeleccionado.precioUnitario}`
                            : ''}
                        </div>
                      ))
                    : '—'}
                </td>
                <td className="p-2 border">
                  {Array.isArray(r.tiempos) && r.tiempos.length > 0
                    ? r.tiempos.map((t, j) => (
                        <div key={j}>
                          {t.maquina}: {t.horas}h
                        </div>
                      ))
                    : '—'}
                </td>
                <td className="p-2 border">
                  {Array.isArray(r.comentarios) && r.comentarios.length > 0
                    ? r.comentarios.map((c, j) => (
                        <div key={j}>"{c.texto}"</div>
                      ))
                    : '—'}
                </td>
                <td className="p-2 border">
                  {Array.isArray(r.documentos) && r.documentos.length > 0
                    ? r.documentos.map((d, j) =>
                        /\.(jpe?g|png|gif)$/i.test(d.url) ? (
                          <img
                            key={j}
                            src={d.url}
                            alt=""
                            className="h-8 mb-1"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div key={j}>
                            <a href={d.url} target="_blank" rel="noopener noreferrer">
                              {d.originalName || 'Descargar'}
                            </a>
                          </div>
                        )
                      )
                    : '—'}
                </td>
              </tr>
            ))}
            {/* Fila de total */}
            <tr>
              <td colSpan={3} />
              <td className="p-2 border font-bold text-right">Total</td>
              <td colSpan={4} className="p-2 border font-bold text-right">
                ${cotizacion.total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer con firmas */}
        <div className="mt-12 flex justify-between">
          <div className="w-1/3 border-t text-center pt-2">Firma de Cliente</div>
          <div className="w-1/3 border-t text-center pt-2">Firma de Vendedor</div>
        </div>

        <p className="mt-6 text-xs text-gray-600">
          Cotización válida por 30 días
        </p>
      </div>

      {/* Botón volver */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
};

export default VerCotizacion;
