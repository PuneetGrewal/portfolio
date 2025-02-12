/** @type {import('tailwindcss').Config} */

const config = {
    darkMode: false, // Don't toggle dark mode anymore
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          background: '#111111', // Dark background
          foreground: '#fefefe', // Light text color on dark background
          card: {
            DEFAULT: '#1c1c1c', // Dark card background
            foreground: '#e0e0e0', // Light card text
          },
          primary: {
            DEFAULT: '#4c97f8', // Dark mode primary color
            foreground: '#ffffff', // Primary foreground color
          },
          secondary: {
            DEFAULT: '#0fa295', // Dark mode secondary color
            foreground: '#ffffff', // Secondary foreground color
          },
          muted: {
            DEFAULT: '#a19595', // Muted color for text or elements
            foreground: '#ffffff',
          },
          border: '#444444', // Dark mode border color
          input: '#333333', // Dark input color
          ring: '#5f6368', // Dark mode ring color
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  };
  
  export default config;
  module.exports = config;
  