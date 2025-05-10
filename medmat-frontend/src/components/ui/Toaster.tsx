// src/components/ui/Toaster.tsx
import { Toaster as HotToaster } from "react-hot-toast";
import { useThemeStore } from "../../store/themeStore";

export const Toaster = () => {
  const { theme } = useThemeStore();

  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 5000,
        style: {
          background: theme === "dark" ? "#2C2C2C" : "#FFFFFF", // dark-bg-alt, light-bg-alt
          color: theme === "dark" ? "#E2E8F0" : "#343A40", // dark-text, light-text
          border: `1px solid ${theme === "dark" ? "#3E3E3E" : "#E9ECEF"}`, // dark-border, light-border
          borderRadius: "0.75rem", // xl
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // shadow-lg
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#28A745", // success color
            secondary: "white",
          },
        },
        error: {
          iconTheme: {
            primary: "#DC3545", // error color
            secondary: "white",
          },
        },
      }}
    />
  );
};
