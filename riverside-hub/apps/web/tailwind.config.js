/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        river: {
          900: "#16302B",
          700: "#204840",
          600: "#2F5D53",
          100: "#E4ECE9",
        },
        paper: "#F6F3EC",
        gold: {
          500: "#C98A2B",
          600: "#A66F20",
        },
        ink: "#1B211E",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
