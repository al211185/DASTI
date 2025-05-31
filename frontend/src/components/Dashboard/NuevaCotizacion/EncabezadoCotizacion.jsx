import React, { useState, useEffect, useContext } from 'react';
import { Field, ErrorMessage } from 'formik';
import axiosInstance from '../../../api/axiosInstance';
import { UserContext } from '../../../context/UserContext';

const EncabezadoCotizacion = ({ header, onChange, vendedores, plantas }) => {
  const [clientes, setClientes] = useState([]);
  const [requisitores, setRequisitores] = useState([]);
  const { user } = useContext(UserContext); // Usuario actual

  // Determinamos el rol en minúsculas
  const userRole = user?.rol?.nombre?.toLowerCase();
  // Sólo estos roles pueden editar
  const canEdit = ['vendedores', 'administrador', 'director', 'disenador'].includes(userRole);

  // Si es jefe de produccion, ocultamos todo el bloque
  if (userRole === 'jefe de produccion') return null;

  // Cargar la lista de clientes de la API al montar el componente
  useEffect(() => {
    axiosInstance
      .get('/clientes')
      .then((response) => {
        setClientes(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener clientes:', error);
      });
  }, []);

  // Actualizar los requisitores basados en el cliente seleccionado
  useEffect(() => {
    if (header.cliente) {
      // Buscamos el cliente cuyo _id coincide con el valor seleccionado
      const selectedCliente = clientes.find((c) => c._id === header.cliente);

      if (selectedCliente && selectedCliente.contactos && selectedCliente.contactos.length > 0) {
        // Extraer solo los nombres de cada contacto
        const nombresContactos = selectedCliente.contactos
          .map((contact) => contact.nombre)
          .filter(Boolean); // filtrar vacíos

        setRequisitores(nombresContactos);

        // Si aún no se ha asignado requisitor en "header", podríamos asignar uno por default
        if (!header.requisitor && nombresContactos.length > 0) {
          onChange('requisitor', nombresContactos[0]);
        }
      } else {
        // Si no hay contactos, vaciamos la lista
        setRequisitores([]);
      }
    } else {
      setRequisitores([]);
    }
  }, [header.cliente, clientes, onChange]);

  // Efecto para asignar automáticamente el vendedor si el usuario actual tiene permisos de ventas.
  useEffect(() => {
    // Determinar si el usuario actual es del rol "Ventas" o pertenece al departamento "ventas"
    const esVendedor =
      user &&
      (user.rol?.nombre === 'vendedores' || user.departamento === 'ventas');

    if (esVendedor && user && !header.vendedor) {
      onChange('vendedor', user._id);
    }
  }, [user, header.vendedor, onChange]);

  // Filtrar la lista de vendedores para mostrar sólo aquellos que cumplan con la condición.
  // Puedes filtrar por rol, departamento, o ambos.
  const vendedoresFiltrados = vendedores.filter((v) => {
    // Si cada vendedor viene con un campo 'rol' (populated) y 'departamento', puedes hacer:
    return (v.rol && v.rol.nombre === 'vendedores') || v.departamento === 'ventas';
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Datos de la Cotización</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 appearance-none"
            value={header.cliente}
            onChange={(e) => onChange('cliente', e.target.value)}
            disabled={!canEdit}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        {/* Requisitor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requisitor</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 appearance-none"
            value={header.requisitor}
            onChange={(e) => onChange('requisitor', e.target.value)}
            disabled={!canEdit}
          >
            <option value="">Seleccione un requisitor</option>
            {requisitores.map((r, index) => (
              <option key={index} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {/* Vendedor */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Vendedor</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 appearance-none"
            value={header.vendedor}
            onChange={(e) => onChange('vendedor', e.target.value)}
            disabled={!canEdit}
          >
            <option value="">Seleccione un vendedor</option>
            {vendedores.map((v) => (
              <option key={v._id} value={v._id}>
                {v.nombre}
              </option>
            ))}
          </select>

        </div>
        {/* Fecha de inicio */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={header.fechaInicio}
            onChange={(e) => onChange('fechaInicio', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        {/* Planta */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Planta</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none"
            value={header.planta}
            onChange={(e) => onChange('planta', e.target.value)}
            disabled={!canEdit}
          >
            <option value="">Seleccione una planta</option>
            {plantas.map((p) => (
              <option key={p._id} value={p._id}>
                {p.serial} - {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tiempo de entrega */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">
            Tiempo de entrega (semanas)
          </label>
          <div className="flex gap-2">
            <Field
              type="number"
              name="header.tiempoEntregaMin"
              placeholder="Min"
              className="w-full border rounded-lg p-2"
              disabled={!canEdit}
            />
            <span className="flex items-center">-</span>
            <Field
              type="number"
              name="header.tiempoEntregaMax"
              placeholder="Max"
              className="w-full border rounded-lg p-2"
              disabled={!canEdit}
            />
          </div>
          <ErrorMessage name="header.tiempoEntregaMin" component="div" className="text-red-500 text-sm" />
          <ErrorMessage name="header.tiempoEntregaMax" component="div" className="text-red-500 text-sm" />
        </div>
        {/* Serial */}
        {header.serial && (
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Serial</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={header.serial || ''}
            readOnly
            />
            </div>
          )}

      </div>
    </div>
  );
};

export default EncabezadoCotizacion;
