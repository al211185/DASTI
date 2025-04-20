// src/components/Dashboard/Clientes/RegistroCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

const RegistroCliente = () => {
  const { id } = useParams();          // si existe → editar
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({
    nombre: '',
    razonSocial: '',
    direccion: {
      calle: '',
      numero: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
    },
    telefono: '',
    email: '',
    sitioWeb: '',
    contactos: [{ nombre: '', cargo: '', telefono: '', email: '' }],
    sector: '',
    comentarios: '',
  });

  const [guardando, setGuardando] = useState(false);

  /* ----------------------- cargar cliente si es edición -------------------- */
  useEffect(() => {
    if (!id) return; // modo creación
    (async () => {
      try {
        const res = await axiosInstance.get(`/clientes/${id}`);
        // Asegura al menos un contacto vacío
        if (!res.data.contactos || !res.data.contactos.length)
          res.data.contactos = [{ nombre: '', cargo: '', telefono: '', email: '' }];
        setCliente(res.data);
      } catch (err) {
        console.error('Error al cargar cliente:', err.response?.data || err.message);
        alert('No se pudo cargar el cliente');
        navigate(-1);
      }
    })();
  }, [id, navigate]);

  /* --------------------- helpers de cambio (inputs) ------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCliente((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setCliente((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContactoChange = (idx, e) => {
    const { name, value } = e.target;
    setCliente((prev) => {
      const c = [...prev.contactos];
      c[idx][name] = value;
      return { ...prev, contactos: c };
    });
  };

  const agregarContacto = () =>
    setCliente((p) => ({
      ...p,
      contactos: [...p.contactos, { nombre: '', cargo: '', telefono: '', email: '' }],
    }));

  const eliminarContacto = (idx) =>
    setCliente((p) => ({ ...p, contactos: p.contactos.filter((_, i) => i !== idx) }));

  /* ----------------------------- submit ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (id) {
        await axiosInstance.put(`/clientes/${id}`, cliente);
      } else {
        await axiosInstance.post('/clientes', cliente);
      }
      navigate('/dashboard/clientes');
    } catch (err) {
      console.error('Error al guardar cliente:', err.response?.data || err.message);
      alert('No se pudo guardar. Revisa la consola.');
    } finally {
      setGuardando(false);
    }
  };

  /* -------------------------------- UI ------------------------------------ */
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {id ? 'Editar Cliente' : 'Registrar Cliente'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ——— datos generales ——— */}
        <Input label="Nombre *" name="nombre" value={cliente.nombre} onChange={handleChange} required />
        <Input label="Razón Social" name="razonSocial" value={cliente.razonSocial} onChange={handleChange} />

        {/* ——— dirección ——— */}
        <fieldset className="border p-4">
          <legend className="px-2">Dirección</legend>
          <Input name="direccion.calle"  label="Calle"        value={cliente.direccion.calle}  onChange={handleChange} />
          <Input name="direccion.numero" label="Número"       value={cliente.direccion.numero} onChange={handleChange} />
          <Input name="direccion.colonia"label="Colonia"      value={cliente.direccion.colonia}onChange={handleChange} />
          <Input name="direccion.ciudad" label="Ciudad"       value={cliente.direccion.ciudad} onChange={handleChange} />
          <Input name="direccion.estado" label="Estado"       value={cliente.direccion.estado} onChange={handleChange} />
          <Input name="direccion.codigoPostal" label="Código Postal"
                 value={cliente.direccion.codigoPostal} onChange={handleChange} />
        </fieldset>

        {/* ——— contacto general ——— */}
        <Input label="Teléfono" name="telefono" value={cliente.telefono} onChange={handleChange} />
        <Input label="Email"    name="email"    type="email" value={cliente.email} onChange={handleChange} />
        <Input label="Sitio Web"name="sitioWeb" value={cliente.sitioWeb} onChange={handleChange} />

        {/* ——— contactos múltiples ——— */}
        <fieldset className="border p-4">
          <legend className="px-2">Contactos</legend>
          {cliente.contactos.map((c, i) => (
            <div key={i} className="mb-4 border-b pb-2">
              <Input name="nombre"   label="Nombre"   value={c.nombre}   onChange={(e) => handleContactoChange(i, e)} />
              <Input name="cargo"    label="Cargo"    value={c.cargo}    onChange={(e) => handleContactoChange(i, e)} />
              <Input name="telefono" label="Teléfono" value={c.telefono} onChange={(e) => handleContactoChange(i, e)} />
              <Input name="email"    type="email" label="Email" value={c.email} onChange={(e) => handleContactoChange(i, e)} />
              {cliente.contactos.length > 1 && (
                <button type="button" onClick={() => eliminarContacto(i)} className="text-red-500 underline">
                  Eliminar este contacto
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={agregarContacto} className="bg-blue-500 text-white px-2 py-1 rounded">
            Agregar otro contacto
          </button>
        </fieldset>

        {/* ——— otros ——— */}
        <Input label="Sector"      name="sector"      value={cliente.sector}      onChange={handleChange} />
        <Textarea label="Comentarios" name="comentarios" value={cliente.comentarios} onChange={handleChange} />

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : id ? 'Actualizar Cliente' : 'Registrar Cliente'}
        </button>
      </form>
    </div>
  );
};

/* ---------- pequeños componentes para reducir repetición ---------- */
const Input = ({ label, name, value, onChange, required, type = 'text' }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border rounded p-2"
    />
  </div>
);

const Textarea = ({ label, name, value, onChange }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <textarea name={name} value={value} onChange={onChange} className="w-full border rounded p-2" />
  </div>
);

export default RegistroCliente;
