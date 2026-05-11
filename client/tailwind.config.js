/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1117",
        "bg-deep": "#0C0E18",
        surface: "#161B27",
        "surface-2": "#1F2535",
        border: "#232938",
        "border-soft": "#1B2030",
        fg: "#E2E4F0",
        muted: "#8F93A9",
        dim: "#545870",
        accent: "#5E6AD2",
        "accent-hover": "#6E7BE5",
        "accent-press": "#4D58B8",
        "accent-soft": "rgba(94,106,210,0.10)",
        navy: { 700: "#5E6AD2", 800: "#E2E4F0", 900: "#0C0E18" },
        steel: { 50: "#1F2535", 100: "#232938", 200: "#2B3245", 500: "#8F93A9" },
        emerald: { 50: "rgba(76,195,138,0.08)", 500: "#4CC38A", 600: "#4CC38A", 700: "#4CC38A", 800: "#C5F3DA" },
        amber: { 50: "rgba(255,178,36,0.08)", 200: "rgba(255,178,36,0.24)", 500: "#FFB224", 600: "#FFB224", 700: "#FFD88A", 800: "#FFE6AD" },
        red: { 50: "rgba(229,72,77,0.08)", 200: "rgba(229,72,77,0.24)", 500: "#E5484D", 600: "#E5484D", 700: "#FFB3B5", 800: "#FFD0D2" },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
