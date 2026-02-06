/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NBL Brand Colors
        primary: '#1E57F7',      // Nile Sapphire
        secondary: '#D4AF37',    // Heritage Gold
        success: '#10B981',      // Forest Green
        accent: '#0E111E',       // Deep Corbeau
      },
      backgroundColor: {
        primary: '#1E57F7',
        secondary: '#D4AF37',
        success: '#10B981',
        accent: '#0E111E',
        brown: '#8B6F47',
      },
      borderColor: {
        primary: '#1E57F7',
        secondary: '#D4AF37',
      },
      textColor: {
        primary: '#1E57F7',
        secondary: '#D4AF37',
        accent: '#0E111E',
        success: '#10B981',
      },
      boxShadow: {
        'primary': '0 4px 20px rgba(30, 87, 247, 0.15)',
        'secondary': '0 4px 20px rgba(212, 175, 55, 0.15)',
      }
    },
  },
  plugins: [],
}
