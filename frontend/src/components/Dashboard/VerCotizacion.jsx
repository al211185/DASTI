// src/components/Dashboard/VerCotizacion.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LogoLetters from '../../Images/Dasti_logo_Letras.png';
import LogoImage from '../../Images/Dasti_logo_Icon.png';

import '../../styles/pdf.css';

const VerCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pdfRef = useRef();

  // ––––––– HELPERS –––––––
  const formatDireccion = ({ calle, numero, colonia, ciudad, estado, codigoPostal }) => {
    if (!calle) return '';
    return `${calle} ${numero}, ${colonia}. C.P. ${codigoPostal} ${ciudad}, ${estado}`;
  };

  const primerContacto = (contactos) => {
    if (!Array.isArray(contactos) || contactos.length === 0) return '';
    const { nombre, cargo } = contactos[0];
    return cargo ? `${nombre} (${cargo})` : nombre;
  };

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
      // Si necesitas múltiples páginas:
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        let remainingHeight = pdfHeight;
        let position = 0;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          remainingHeight -= pdf.internal.pageSize.getHeight();
          position -= pdf.internal.pageSize.getHeight();
          if (remainingHeight > 0) pdf.addPage();
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`cotizacion_${cotizacion.serial}.pdf`);
    });
};


  if (loading) return <p className="p-4">Cargando cotización...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!cotizacion) return <p className="p-4">Cotización no encontrada.</p>;

  const sumaImportes = cotizacion.renglones.reduce(
    (acc, r) => acc + (r.costo || 0),
  0
  );

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleGeneratePDF}
          className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded">
          Descargar PDF
        </button>
      </div>

      <div ref={pdfRef} className="pdf-container border">
        {/* Header azul */}
        <header className="pdf-header">
          <div className="header-left">
            <img src={LogoImage} alt="Logo icono" className="logo-icon" />
            <img src={LogoLetters} alt="Logo letras" className="logo-text" />
          </div>

          <div className="header-right">
            <div>
              <span className="label-blue">FOLIO:</span> {cotizacion.serial}
            </div>
            <div>
              <span className="label-blue">FECHA:</span> {new Date(cotizacion.fechaInicio)
                .toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                .toUpperCase()}
            </div>
            <div>
              <span className="label-blue">HORA:</span> {new Date(cotizacion.fechaInicio)
                .toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                .toLowerCase()}
            </div>
          </div>
        </header>

        {/* --- SECCIÓN DE DATOS DE LA EMPRESA --- */}
        <section className="company-info">
          <h2>DESARROLLO DE APLICACIONES Y SERVICIOS TÉCNICOS E INDUSTRIALES S. DE R.L. DE C.V.</h2>
          <p className="company-rfc">DDA100126IX5</p>
          <p>OCTAVA 1419, TORRES DEL PRI, C.P. 32574, CD. JUÁREZ, CHIHUAHUA, MÉXICO</p>
          <p>656 208 0800</p>
        </section>

        {/* --- SECCIÓN CLIENTE / DOMICILIO / TELÉFONO / CONTACTO / ENTREGA / PÁGINA --- */}
        <section className="client-info">
          <div className="info-left">
            <div className="info-item">
              <span className="label orange">CLIENTE:</span>
              <span className="value">{cotizacion.cliente.nombre}</span>
            </div>
            <div className="info-item">
              <span className="label orange">DOMICILIO:</span>
              <span className="value">
                {formatDireccion(cotizacion.cliente.direccion)}
              </span>
            </div>
            <div className="info-item">
              <span className="label orange">TELÉFONO:</span>
              <span className="value">{cotizacion.cliente.telefono}</span>
            </div>
            <div className="info-item">
              <span className="label orange">CONTACTO:</span>
              <span className="value">
                {primerContacto(cotizacion.cliente.contactos)}
              </span>
            </div>
            <div className="info-item">
              <span className="label orange">TIEMPO DE ENTREGA:</span>
              <span className="value">
                {cotizacion.tiempoEntregaMin} – {cotizacion.tiempoEntregaMax} semanas
              </span>
            </div>
            <div className="info-item">
              <span className="label orange">PÁGINA:</span>
              <span className="value">1 DE {cotizacion.totalPaginas || 1}</span>
            </div>
          </div>
        </section>

        {/* Tabla de renglones */}
        <table className="w-full border-collapse mt-6">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="p-2 border bg-orange-600 text-white">Cantidad</th>
              <th className="p-2 border bg-orange-600 text-white">Descripción</th>
              <th className="p-2 border bg-orange-600 text-white">Precio</th>
              <th className="p-2 border bg-orange-600 text-white text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.renglones.map((r, i) => (
              <tr key={i}>
                <td className="p-2 border text-center">{r.cantidad}</td>
                <td className="p-2 border">{r.descripcion}</td>
                <td className="p-2 border text-right">
                  ${r.cantidad > 0? ( (r.costo || 0) / r.cantidad ).toFixed(2) : '0.00'}
                </td>
                <td className="p-2 border text-right">
                  ${(r.costo || 0).toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Fila de total */}
            <tr>
              <td colSpan={2} />
              <td className="p-2 border font-bold text-right">Total</td>
              <td className="p-2 border font-bold text-right">
                ${sumaImportes.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer*/}
        <section className="footer-messages">
          <p>ESTOS PRECIOS NO INCLUYEN IVA</p>
          <p>ESTA COTIZACIÓN TIENE VALIDEZ DE TREINTA DÍAS A PARTIR DE SU FECHA ELABORADA</p>
        </section>
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
