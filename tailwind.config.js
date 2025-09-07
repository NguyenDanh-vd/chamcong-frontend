/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // App Router (Next.js 13+)
    "./pages/**/*.{js,ts,jsx,tsx}", // Pages Router (Next.js <13 hoặc dùng song song)
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // ✅ bật dark mode theo class
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary-color)",
        "primary-dark": "var(--primary-color-dark)",
      },
    },
  },
  plugins: [],
};
