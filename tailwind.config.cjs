/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: "#2B6CB0",
        brandGreen: "#10B981"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)"
      },
      borderRadius: {
        "2xl": "1rem"
      }
    }
  },
  plugins: []
};
