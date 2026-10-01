import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E4EEE8', 100: '#D4E5DA', 200: '#B6D3C1', 300: '#8DB79F', 400: '#5B9678',
          500: '#287A5B', 600: '#236B50', 700: '#1E5C45', 800: '#174D3A', 900: '#123D2F', 950: '#0D2D22',
        },
        darkpine: {
          800: '#1e3329',
          900: '#13231c',
          950: '#0c1611',
        },
        accent: {
          teal: '#287A5B',
          amber: '#E86F51',
          rose: '#f43f5e',
          indigo: '#6366f1',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 25px rgba(34, 197, 94, 0.25)',
      }
    },
  },
  plugins: [],
};
export default config;
