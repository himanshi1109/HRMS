/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Defining colors directly under theme (not extend) disables default Tailwind colors
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#E8E3DD', // Map white to off-white
      black: '#2E1F1B', // Map black to walnut-noir
      
      'walnut-noir': '#2E1F1B',
      'deep-brown': '#3D2B26',
      'mid-brown': '#5E4B43',
      'light-brown': '#8B7B6F',
      'taupe-light': '#B5A89E',
      'warm-cream': '#D4C9BE',
      'off-white': '#E8E3DD',
      'accent-brown': '#704A3C',

      charcoal: {
        bg: '#2E1F1B',
        sidebar: '#3D2B26',
        navbar: '#3D2B26',
        deep: '#2E1F1B',
        black: '#2E1F1B',
      },
      indigo: {
        brand: '#704A3C',
        hover: '#8B7B6F',
        active: '#704A3C',
        muted: '#5E4B43',
        border: '#5E4B43',
        darkest: '#2E1F1B',
      },
      teal: {
        chart1: '#E8E3DD',
        chart2: '#704A3C',
        chart3: '#5E4B43',
        chart4: '#3D2B26',
        accent: '#704A3C',
        steel1: '#E8E3DD',
        steel2: '#704A3C',
        steel3: '#5E4B43',
      },
      grey: {
        text: '#8B7B6F',
        placeholder: '#B5A89E',
        divider: '#5E4B43',
        disabled: '#B5A89E',
      },
      foggy: {
        card: '#5E4B43',
        hover: '#3D2B26',
      },
      stardust: {
        text: '#E8E3DD',
        card: '#5E4B43',
        border: '#5E4B43',
      },
      badge: {
        present: '#8B7B6F',
        absent: '#2E1F1B',
        pending: '#5E4B43',
        approved: '#8B7B6F',
        late: '#5E4B43',
      }
    },
    extend: {
      boxShadow: {
        'brown-glow': '0 0 30px rgba(112, 74, 60, 0.15)',
        'brown-glow-active': '0 0 20px rgba(112, 74, 60, 0.40)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(4px, -8px)' },
        }
      }
    },
  },
  plugins: [],
}
