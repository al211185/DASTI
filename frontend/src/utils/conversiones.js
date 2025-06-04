// src/utils/conversiones.js

/**
 * Convierte una cantidad `value` desde `fromUnit` hacia `toUnit`.
 * Se incluyen las unidades más comunes en un taller o maquiladora:
 * - Longitud: mm, cm, m, in, ft, yd
 * - Masa/Peso: g, kg, lb
 *
 * Si la conversión no está definida, devuelve `value` sin cambios.
 */
export function convertir(value, fromUnit, toUnit) {
  if (!value || isNaN(value)) return 0;
  const v = parseFloat(value);

  // Factores de conversión directos: { "from-to": factor }
  const factors = {
    // ─── LONGITUD ───
    // Milímetros ↔ Centímetros
    "mm-cm": 0.1,
    "cm-mm": 10,

    // Milímetros ↔ Metros
    "mm-m": 0.001,
    "m-mm": 1000,

    // Centímetros ↔ Metros
    "cm-m": 0.01,
    "m-cm": 100,

    // Milímetros ↔ Pulgadas
    "mm-in": 0.0393701,
    "in-mm": 25.4,

    // Centímetros ↔ Pulgadas
    "cm-in": 0.393701,
    "in-cm": 2.54,

    // Metros ↔ Pulgadas
    "m-in": 39.3701,
    "in-m": 0.0254,

    // Metros ↔ Pies
    "m-ft": 3.28084,
    "ft-m": 0.3048,

    // Pulgadas ↔ Pies
    "in-ft": 0.0833333,
    "ft-in": 12,

    // Metros ↔ Yardas
    "m-yd": 1.09361,
    "yd-m": 0.9144,

    // Pies ↔ Yardas
    "ft-yd": 0.333333,
    "yd-ft": 3,

    // Centímetros ↔ Pies
    "cm-ft": 0.0328084,
    "ft-cm": 30.48,

    // ─── MASA/PESO ───
    // Gramos ↔ Kilogramos
    "g-kg": 0.001,
    "kg-g": 1000,

    // Gramos ↔ Libras
    "g-lb": 0.00220462,
    "lb-g": 453.592,

    // Kilogramos ↔ Libras
    "kg-lb": 2.20462,
    "lb-kg": 0.453592,
  };

  const key = `${fromUnit}-${toUnit}`;
  const factor = factors[key];

  if (!factor) {
    console.warn(`No existe factor de conversión '${key}'. Devuelvo ${v} sin cambios.`);
    return v;
  }

  return v * factor;
}
