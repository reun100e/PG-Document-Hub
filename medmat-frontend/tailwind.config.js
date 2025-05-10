/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // New Palette
        primary: {
          light: "#66B2B2", // Lighter Teal
          DEFAULT: "#007A7A", // Dark Teal
          dark: "#005050", // Darker Teal
        },
        accent: {
          light: "#FFB299", // Lighter Coral
          DEFAULT: "#FF7F50", // Coral
          dark: "#CC6640", // Darker Coral
        },
        // Neutrals for Light Mode
        "light-bg": "#F8F9FA",
        "light-bg-alt": "#FFFFFF", // For cards, modals
        "light-border": "#E9ECEF",
        "light-border-hover": "#CED4DA",
        "light-text": "#343A40", // Primary text
        "light-text-secondary": "#6C757D", // Muted text

        // Neutrals for Dark Mode
        "dark-bg": "#171717", // Slightly off-black for main background
        "dark-bg-alt": "#222222", // For cards, modals in dark mode
        "dark-border": "#3E3E3E",
        "dark-border-hover": "#505050",
        "dark-text": "#E2E8F0", // Primary text
        "dark-text-secondary": "#A0AEC0", // Muted text

        // Semantic colors (optional, can use primary/accent directly)
        success: "#28A745",
        error: "#DC3545",
        warning: "#FFC107",
        info: "#17A2B8",
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans], // Add Inter
      },
      boxShadow: {
        "soft-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "soft-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        // Dark mode shadows (can be more subtle)
        "dark-soft-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15)",
        "dark-soft-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        xl: "0.75rem", // Slightly larger default for cards/modals
        "2xl": "1rem",
      },
      animation: {
        modalShow: "modal-show-animation 0.2s ease-out forwards",
        // Add more animations as needed
        "subtle-pulse": "subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "modal-show-animation": {
          "0%": { transform: "scale(0.95) translateY(10px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "subtle-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".7" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // Use class strategy for better control
    }),
  ],
};
