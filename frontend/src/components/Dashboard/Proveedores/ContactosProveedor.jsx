// src/components/Dashboard/Proveedores/ContactosProveedor.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function ContactosProveedor() {
  const [listaContactosProv, setListaContactosProv] = useState([]);
  const [listaContactosCli, setListaContactosCli] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Hacemos dos peticiones en paralelo: proveedores y clientes
    Promise.all([
      axiosInstance.get('/proveedores'),
      axiosInstance.get('/clientes')
    ])
      .then(([resProv, resCli]) => {
        // 1. Procesar respuesta de proveedores
        const proveedores = resProv.data;
        console.log('proveedores[]:', proveedores);

        const contactosProv = proveedores.map(prov => ({
          id: prov._id,
          tipo: 'Proveedor',
          empresa: prov.nombre || '(sin nombre)',
          contactoNombre: prov.contactoNombre || '(sin contacto)',
          correo: prov.correo || '(sin correo)',
          telefonoOficina: prov.telefonoOficina || '(sin tel. oficina)',
          telefonoWhatsapp: prov.telefonoWhatsapp || '(sin whatsapp)',
          cargo: '(no aplica)' // Los proveedores no tienen campo cargo
        }));
        console.log('contactosProv mapeados:', contactosProv);
        setListaContactosProv(contactosProv);

        // 2. Procesar respuesta de clientes
        const clientes = resCli.data;
        console.log('clientes[]:', clientes);

        // Cada cliente tiene un array `contactos`; vamos a "desanidar" ese array
        const contactosCli = [];
        clientes.forEach(cli => {
          const nombreEmpresa = cli.nombre || '(sin nombre)';
          // si no hay contactos, añadimos una fila indicando "(sin contactos)"
          if (!Array.isArray(cli.contactos) || cli.contactos.length === 0) {
            contactosCli.push({
              id: cli._id + '-vacio',       // id único para fila vacía
              tipo: 'Cliente',
              empresa: nombreEmpresa,
              contactoNombre: '(sin contacto)',
              correo: cli.email || '(sin correo)',
              telefonoOficina: cli.telefono || '(sin tel.)',
              telefonoWhatsapp: '(no aplica)',
              cargo: '(no aplica)'
            });
          } else {
            // si sí hay contactos, cada uno se convierte en una fila
            cli.contactos.forEach(ct => {
              contactosCli.push({
                id: ct._id,                // usa el _id del subdocumento
                tipo: 'Cliente',
                empresa: nombreEmpresa,
                contactoNombre: ct.nombre || '(sin nombre contacto)',
                correo: ct.email || '(sin correo)',
                telefonoOficina: ct.telefono || '(sin tel.)',
                telefonoWhatsapp: '(no aplica)',
                cargo: ct.cargo || '(sin cargo)'
              });
            });
          }
        });
        console.log('contactosCli mapeados:', contactosCli);
        setListaContactosCli(contactosCli);

        setCargando(false);
      })
      .catch(err => {
        console.error('Error al cargar contactos:', err);
        setError('No fue posible cargar los contactos.');
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center">
        <p className="text-gray-600">Cargando contactos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-10">
        {/* Sección: Contactos de proveedores */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Contactos de Proveedores
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg shadow transition"
            >
              ← Volver
            </button>
          </div>

          {listaContactosProv.length === 0 ? (
            <p className="text-gray-600">No se encontraron contactos de proveedores.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Empresa</th>
                    <th className="py-2 px-4 text-left">Contacto</th>
                    <th className="py-2 px-4 text-left">Correo</th>
                    <th className="py-2 px-4 text-left">Tel. Oficina</th>
                    <th className="py-2 px-4 text-left">Tel. Whatsapp</th>
                  </tr>
                </thead>
                <tbody>
                  {listaContactosProv.map(
                    ({
                      id,
                      empresa,
                      contactoNombre,
                      correo,
                      telefonoOficina,
                      telefonoWhatsapp
                    }) => (
                      <tr key={id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{empresa}</td>
                        <td className="py-2 px-4">{contactoNombre}</td>
                        <td className="py-2 px-4">{correo}</td>
                        <td className="py-2 px-4">{telefonoOficina}</td>
                        <td className="py-2 px-4">{telefonoWhatsapp}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección: Contactos de clientes */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Contactos de Clientes
          </h2>
          {listaContactosCli.length === 0 ? (
            <p className="text-gray-600">No se encontraron contactos de clientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Empresa</th>
                    <th className="py-2 px-4 text-left">Contacto</th>
                    <th className="py-2 px-4 text-left">Cargo</th>
                    <th className="py-2 px-4 text-left">Correo</th>
                    <th className="py-2 px-4 text-left">Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {listaContactosCli.map(
                    ({
                      id,
                      empresa,
                      contactoNombre,
                      cargo,
                      correo,
                      telefonoOficina
                    }) => (
                      <tr key={id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{empresa}</td>
                        <td className="py-2 px-4">{contactoNombre}</td>
                        <td className="py-2 px-4">{cargo}</td>
                        <td className="py-2 px-4">{correo}</td>
                        <td className="py-2 px-4">{telefonoOficina}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
