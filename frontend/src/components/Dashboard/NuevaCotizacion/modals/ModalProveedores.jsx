// src/components/Dashboard/NuevaCotizacion/modals/ModalProveedores.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const ModalProveedores = ({ material, onClose, onProveedorSelect }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProveedores = async () => {
      if (!material?._id) {
        setProveedores([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const query = `?material=${encodeURIComponent(material._id)}`;
        const response = await axiosInstance.get('/proveedores' + query);
        setProveedores(response.data);
      } catch (err) {
        console.error('Error al obtener proveedores:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchProveedores();
  }, [material]);

  if (loading) return <div className="p-4 text-center">Cargando proveedores…</div>;
  if (error) return (
    <div className="p-4">
      <p className="text-red-500">Error: {error}</p>
      <button onClick={onClose} className="mt-2 bg-gray-300 px-4 py-2 rounded">
        Cerrar
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-6 w-full max-w-lg rounded shadow relative">
        <h2 className="text-xl font-semibold mb-4">
          Proveedores para «{material?.nombre}»
        </h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Proveedor</th>
              <th className="p-2 border text-left">Presentación</th>
              <th className="p-2 border text-left">Precio Presentación</th>
              <th className="p-2 border text-left">Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(prov => {
              // 1) Buscas la subdoc correcta
              const ofertaRaw = prov.materiales.find(m =>
                m.material?._id?.toString() === material._id.toString()
              );
              if (!ofertaRaw) return null;

              // 2) Fallback: precioPresentacion puede o no existir,
              //    precioUnitario puede venir de datos antiguos
              const precioPresentacion = ofertaRaw.precioPresentacion ?? ofertaRaw.precioUnitario ?? 0;
              const factorConversion = ofertaRaw.factorConversion ?? 1;
              // 3) Calculas tu precio por unidad base de forma unificada
              const precioUnitario = precioPresentacion / factorConversion;

              return (
                <tr
                  key={prov._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    // Le pasas al padre la oferta ya normalizada
                    onProveedorSelect({
                      proveedor: prov,
                      oferta: {
                        ...ofertaRaw,
                        precioPresentacion,
                        factorConversion,
                        precioUnitario
                      }
                    });
                    onClose();
                  }}
                >
                  <td className="p-2 border">{prov.nombre}</td>

                  {/* Muestro la presentación tal cual */}
                  <td className="p-2 border">
                    {ofertaRaw.cantidadPresentacion ?? 1}{' '}
                    {ofertaRaw.unidadPresentacion || material.unidadMedida}
                  </td>

                  {/* Precio de la presentación */}
                  <td className="p-2 border">
                    ${precioPresentacion.toFixed(2)}
                  </td>

                  {/* Precio por unidad base */}
                  <td className="p-2 border">
                    ${precioUnitario.toFixed(2)} / {material.unidadMedida}
                  </td>
                </tr>
              );
            })}

            {proveedores.length === 0 && (
              <tr>
                <td colSpan="4" className="p-2 border text-center">
                  No se encontraron proveedores.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProveedores;
