/** @type {import('tailwindcss').Config} */
export default {
  content: [    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',],
  theme: {
    extend: {
      colors: {
        primary: '#107CBC',         // azul logo
        'primary-dark': '#0D5A84',  // azul oscuro para hover
        secondary: '#E97824',       // naranja logo
        'secondary-dark': '#C2601E',// naranja oscuro para hover
        accent1: '#2C3E50',         // gris azulado oscuro
        accent2: '#F2A65A',         // naranja claro / dorado
        accent3: '#A3B5C3',         // azul grisáceo suave
      }
    },
  },
  plugins: [],
}