/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  prefix: 'xpo_',
  content: [...Array(10)].map((u, i) => `./src/js/hunting/${[...Array(i + 1)].map(o => '**/').join('')}*.{js,jsx,ts,tsx}`),
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e63f51",
          50: "#fdedef",
          100: "#fbdadd",
          200: "#f7b5bb",
          300: "#f39099",
          400: "#ef6b77",
          500: "#e63f51",
          600: "#bf3443",
          700: "#992a36",
          800: "#731f28",
          900: "#4c141b",
        },
        secondary: {
          DEFAULT: "#FFC52F",
          50: "#fff9e6", 
          100: "#fff3cc",
          200: "#ffe799",
          300: "#ffdb66",
          400: "#ffcf33",
          500: "#FFC52F",
          600: "#cca026",
          700: "#997a1d",
          800: "#665213",
          900: "#33290a",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      zIndex: {
        100: '100',
        999: '999',
      },
      screens: {
        '3xl': '1920px',
      }
    }
  },
  plugins: [
    require('daisyui')
  ],
  // corePlugins: {
  //   preflight: false,
  // },
  // safelist: [
  //   {
  //     pattern: /xpo_/,
  //   },
  // ],
}