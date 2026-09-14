import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        canvas: "#f2f1ed",
        ink: "#1f2328",
        muted: "#6d737b",
        line: "#d8d8d2",
        accent: "#1f5f4a",
        danger: "#a93434",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,.08)",
        dialog: "0 24px 80px rgba(0,0,0,.3)",
      },
    },
  },
  plugins: [],
};
export default config;
