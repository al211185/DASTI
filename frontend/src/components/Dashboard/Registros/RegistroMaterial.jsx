import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const UNIDADES_MEDIDA = [
    'PIES',
    'PULGADAS',
    'LIBRAS',
    'MILIMETROS',
    'CENTIMETROS',
    'GRAMOS',
    'KILOS'
];

const RegistroMaterial = () => {
    const [material, setMaterial] = useState({
        nombre: '',
        categoria: '', // aquí se almacenará el _id de la categoría seleccionada
        unidadMedida: ''
    });
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Obtén las categorías desde el backend
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await axiosInstance.get('/categorias');

                setCategorias(res.data);
            } catch (err) {
                console.error('Error al obtener categorías:', err);
            }
        };
        fetchCategorias();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMaterial((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Se envían solo los campos necesarios: nombre, categoría y unidad de medida
            const response = await axiosInstance.post('/materiales', material);
            console.log('Material registrado:', response.data);
            navigate('/dashboard/registro/material'); // Redirige a la lista de materiales o muestra un mensaje
        } catch (err) {
            console.error('Error al registrar material:', err);
            setError(err.response?.data?.msg || err.message);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Registrar Material</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del material */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Nombre del Material
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={material.nombre}
                        onChange={handleChange}
                        placeholder="Ingresa el nombre"
                        className="w-full border rounded p-2"
                        required
                    />
                </div>
                {/* Categoría (select de las categorías existentes) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Categoría
                    </label>
                    <select
                        name="categoria"
                        value={material.categoria}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        required
                    >
                        <option value="">-- Selecciona una categoría --</option>
                        {categorias.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Unidad de Medida */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Unidad de Medida
                    </label>
                    <select
                        name="unidadMedida"
                        value={material.unidadMedida}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        required
                    >
                        <option value="">-- Selecciona la unidad --</option>
                        {UNIDADES_MEDIDA.map((unidad, idx) => (
                            <option key={idx} value={unidad}>
                                {unidad}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Registrar Material
                </button>
            </form>
        </div>
    );
};

export default RegistroMaterial;
