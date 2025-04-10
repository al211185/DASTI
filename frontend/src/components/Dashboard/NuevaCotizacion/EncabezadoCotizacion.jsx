// src/components/Dashboard/NuevaCotizacion/EncabezadoCotizacion.jsx
import React from 'react';
import { Field, ErrorMessage } from 'formik';

const EncabezadoCotizacion = ({ header, onChange, clientes, requisitores, vendedores, plantas }) => {
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
              <option key={c} value={c}>
                {c}
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
            {requisitores.map((r) => (
              <option key={r} value={r}>
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
              <option key={v} value={v}>
                {v}
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
              <option key={p} value={p}>
                {p}
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
            value={header.serial}
            onChange={(e) => onChange('serial', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default EncabezadoCotizacion;
