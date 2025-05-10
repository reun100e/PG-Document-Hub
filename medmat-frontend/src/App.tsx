// src/App.tsx
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer"; // Import the new Footer
import { useAuth } from "./hooks/useAuth";
import { fetchCurrentUser } from "./services/authService";
import { Toaster } from "./components/ui/Toaster";

function App() {
  const { token, user, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (token && !user && !authIsLoading) {
      fetchCurrentUser();
    }
  }, [token, user, authIsLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text selection:bg-primary/30 dark:selection:bg-primary-dark/30">
      <Navbar />
      <main className="flex-grow w-full container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppRoutes />
      </main>
      <Footer /> {/* Add the Footer component here */}
      <Toaster />
    </div>
  );
}

export default App;
