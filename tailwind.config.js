/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        borderWhite: "#ffffff",
        grayDark: "#2e2e2e",
        navyDark: "#0b1c2c",
        electricBlue: "#3B82F6",
        blackMain: "#000000",
      },
    },
  },
  plugins: [],
}
