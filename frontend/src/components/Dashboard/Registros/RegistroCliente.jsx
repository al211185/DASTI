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
    prefijo: ''
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
      navigate('/dashboard/registro/clientes');
    } catch (err) {
      console.error('Error al guardar cliente:', err.response?.data || err.message);
      alert('No se pudo guardar. Revisa la consola.');
    } finally {
      setGuardando(false);
    }
  };

  /* -------------------------------- UI ------------------------------------ */
  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto bg-white border rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {id ? 'Editar Cliente' : 'Registrar Cliente'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* — Nombre & Prefijo & Razón Social — */}

          <div>
            <Input label="Nombre *" name="nombre" value={cliente.nombre} onChange={handleChange} required />
          </div>
          <div>
            <Input
              label="Prefijo *"
              name="prefijo"
              value={cliente.prefijo}
              onChange={handleChange}
              required
            // Puedes agregar un placeholder si quieres, p.ej. "CA, CB, etc."
            />
          </div>
          <div>
            <Input label="Razón Social" name="razonSocial" value={cliente.razonSocial} onChange={handleChange} />
          </div>

          {/* — Dirección (2 columnas) — */}
          <fieldset className="md:col-span-2 border rounded-xl p-4">
            <legend className="text-gray-700 font-medium px-2">Dirección</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="Calle" name="direccion.calle" value={cliente.direccion.calle} onChange={handleChange} />
              <Input label="Número" name="direccion.numero" value={cliente.direccion.numero} onChange={handleChange} />
              <Input label="Colonia" name="direccion.colonia" value={cliente.direccion.colonia} onChange={handleChange} />
              <Input label="Ciudad" name="direccion.ciudad" value={cliente.direccion.ciudad} onChange={handleChange} />
              <Input label="Estado" name="direccion.estado" value={cliente.direccion.estado} onChange={handleChange} />
              <Input label="Código Postal" name="direccion.codigoPostal" value={cliente.direccion.codigoPostal} onChange={handleChange} />
            </div>
          </fieldset>

          {/* — Teléfono & Email — */}
          <div>
            <Input label="Teléfono" name="telefono" value={cliente.telefono} onChange={handleChange} />
          </div>
          <div>
            <Input label="Email" name="email" type="email" value={cliente.email} onChange={handleChange} />
          </div>

          {/* — Sitio Web & Sector — */}
          <div>
            <Input label="Sitio Web" name="sitioWeb" value={cliente.sitioWeb} onChange={handleChange} />
          </div>
          <div>
            <Input label="Sector" name="sector" value={cliente.sector} onChange={handleChange} />
          </div>

          {/* — Contactos múltiples — */}
          <fieldset className="md:col-span-2 border rounded-xl p-4">
            <legend className="text-gray-700 font-medium px-2">Contactos</legend>
            <div className="space-y-6 mt-4">
              {cliente.contactos.map((c, i) => (
                <div key={i} className="relative border-b pb-4">
                  {cliente.contactos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarContacto(i)}
                      className="absolute top-0 right-4 transform -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Eliminar
                    </button>
                  )}
                  <Input label="Nombre" name="nombre" value={c.nombre} onChange={e => handleContactoChange(i, e)} />
                  <Input label="Cargo" name="cargo" value={c.cargo} onChange={e => handleContactoChange(i, e)} />
                  <Input label="Teléfono" name="telefono" value={c.telefono} onChange={e => handleContactoChange(i, e)} />
                  <Input label="Email" name="email" type="email" value={c.email} onChange={e => handleContactoChange(i, e)} />
                </div>
              ))}
              <button
                type="button"
                onClick={agregarContacto}
                className="inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark"
              >
                + Agregar contacto
              </button>
            </div>
          </fieldset>

          {/* — Comentarios (span 2) — */}
          <div className="md:col-span-2">
            <Textarea label="Comentarios" name="comentarios" value={cliente.comentarios} onChange={handleChange} />
          </div>

          {/* — Botón Guardar (span 2) — */}
          <div className="md:col-span-2 text-center">
            <button
              type="submit"
              disabled={guardando}
              className="w-1/2 bg-orange-600 text-white py-3 rounded-full hover:bg-orange-700 disabled:opacity-50"
            >
              {guardando ? 'Guardando…' : id ? 'Actualizar Cliente' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, required, type = 'text' }) {
  return (
    <div>
      {label && <label htmlFor={name} className="block mb-1 text-gray-700">{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={onChange}
        className="w-full h-12 bg-gray-200 placeholder-gray-600 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function Textarea({ label, name, value, onChange }) {
  return (
    <div>
      {label && <label htmlFor={name} className="block mb-1 text-gray-700">{label}</label>}
      <textarea
        id={name}
        name={name}
        rows={4}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-200 placeholder-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};

export default RegistroCliente;