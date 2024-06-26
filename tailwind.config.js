/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "input-custom": "#322f3b",
        "input-placeholder": "#98979e",
      },
      maxHeight: {
        input: "62px",
      },
      borderRadius: {
        custom: "20px",
      },
      borderColor: {
        custom: "#322f3b",
      },
    },
  },
  plugins: [],
};
