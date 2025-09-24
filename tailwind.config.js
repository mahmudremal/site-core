/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // '[data-theme="dark"]',
  prefix: 'xpo_', // /hunting
  content: ['./server/app.jsx', './inc/widgets/ecommerce/ProductMetabox.jsx', ...Array(10)].map((u, i) => `./src/js/${[...Array(i + 1)].map(o => '**/').join('')}*.{js,jsx,ts,tsx}`),
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
        },
        markethia: {
          DEFAULT: "#02424F",
          50:  "#E6F1F3",
          100: "#CCE3E6",
          200: "#99C6CC",
          300: "#66A9B3",
          400: "#338C99",
          500: "#007080",
          600: "#005966",
          700: "#00434D",
          800: "#022D33",
          900: "#01171A",
        },
        scprimary: {
          DEFAULT: "#0A1D37",
          50:  "#e1e5ec",
          100: "#bcc7d8",
          200: "#8ba1b9",
          300: "#597b9a",
          400: "#37567f",
          500: "#0a1d37",
          600: "#091931",
          700: "#061225",
          800: "#040d1a",
          900: "#02090f"
        },
        scwhite: {
          DEFAULT: "#F5F7FA",
          50:  "#FFFFFF",
          100: "#FDFEFF",
          200: "#F9FAFC",
          300: "#F5F7FA",
          400: "#E9EDF3",
          500: "#DCE2EB",
          600: "#C3CBD6",
          700: "#9FA8B4",
          800: "#7A8491",
          900: "#5B626D"
        },
        scaccent: {
          DEFAULT: "#6C5DD3",
          50:  "#F0EEFC",
          100: "#DCD8F7",
          200: "#C1B8F2",
          300: "#A697ED",
          400: "#8D7AE5",
          500: "#6C5DD3",
          600: "#5E50BB",
          700: "#4C4097",
          800: "#393172",
          900: "#28234F"
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