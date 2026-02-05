import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {

      colors: {
        background: '#000000',
        foreground: "var(--foreground)",
        brand: {
          dark: '#000000',      // Pure Black
          panel: '#111111',     // Almost Black
          light: '#222222',     // Dark Gray
          peach: '#FF3333',     // Bright Red (replacing Peach)
          red: '#DC2626',       // Standard Red 600
          burgundy: '#450a0a',  // Red 950
        },
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',      // Red 600
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',     // Red 950
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        clean: ["var(--font-cormorant)", "serif"],
        cursive: ["var(--font-great-vibes)", "cursive"],
        blacksword: ["var(--font-great-vibes)", "cursive"],
        mono: ["var(--font-geist-mono)"],
        serif: ['var(--font-playfair)', 'serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
