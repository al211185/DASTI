import React, { useState, useEffect, useContext } from 'react';
import { Field, ErrorMessage } from 'formik';
import axiosInstance from '../../../api/axiosInstance';
import { UserContext } from '../../../context/UserContext';

const EncabezadoCotizacion = ({ header, onChange, vendedores, plantas }) => {
  const [clientes, setClientes] = useState([]);
  const [requisitores, setRequisitores] = useState([]);
  const { user } = useContext(UserContext); // Usuario actual

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
      if (
        selectedCliente &&
        selectedCliente.contactoPrincipal &&
        selectedCliente.contactoPrincipal.nombre
      ) {
        const nombreRequisitor = selectedCliente.contactoPrincipal.nombre;
        setRequisitores([nombreRequisitor]);
        // Si aún no se ha asignado, se asigna automáticamente al header
        if (!header.requisitor) {
          onChange('requisitor', nombreRequisitor);
        }
      } else {
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
      (user.rol?.nombre === 'Ventas' || user.departamento === 'ventas');

    if (esVendedor && user && !header.vendedor) {
      onChange('vendedor', user._id);
    }
  }, [user, header.vendedor, onChange]);

  // Filtrar la lista de vendedores para mostrar sólo aquellos que cumplan con la condición.
  // Puedes filtrar por rol, departamento, o ambos.
  const vendedoresFiltrados = vendedores.filter((v) => {
    // Si cada vendedor viene con un campo 'rol' (populated) y 'departamento', puedes hacer:
    return (v.rol && v.rol.nombre === 'Ventas') || v.departamento === 'ventas';
  });
  
  return (
    <div className="bg-white p-4 rounded shadow space-y-4 mb-6">
      <h2 className="text-xl font-semibold">Datos de la Cotización</h2>
      <div className="flex flex-wrap gap-4">
        {/* Cliente */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            className="w-full border rounded p-2"
            value={header.cliente}
            onChange={(e) => onChange('cliente', e.target.value)}
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
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Requisitor</label>
          <select
            className="w-full border rounded p-2"
            value={header.requisitor}
            onChange={(e) => onChange('requisitor', e.target.value)}
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
            className="w-full border rounded p-2"
            value={header.vendedor}
            onChange={(e) => onChange('vendedor', e.target.value)}
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
            className="w-full border rounded p-2"
            value={header.fechaInicio}
            onChange={(e) => onChange('fechaInicio', e.target.value)}
          />
        </div>
        {/* Planta */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Planta</label>
          <select
            className="w-full border rounded p-2"
            value={header.planta}
            onChange={(e) => onChange('planta', e.target.value)}
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
              className="w-full border rounded p-2"
            />
            <span className="flex items-center">-</span>
            <Field
              type="number"
              name="header.tiempoEntregaMax"
              placeholder="Max"
              className="w-full border rounded p-2"
            />
          </div>
          <ErrorMessage name="header.tiempoEntregaMin" component="div" className="text-red-500 text-sm" />
          <ErrorMessage name="header.tiempoEntregaMax" component="div" className="text-red-500 text-sm" />
        </div>
        {/* Serial */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Serial</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={header.serial || ''}
            readOnly
          />
        </div>

      </div>
    </div>
  );
};

export default EncabezadoCotizacion;
