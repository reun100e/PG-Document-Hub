import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]; // Optional: specify roles that can access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can return a loading spinner component here
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to so we can send them along after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role-based access if allowedRoles is provided
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have the required role
    // Redirect to an "Unauthorized" page or back to dashboard
    return (
      <Navigate
        to="/dashboard"
        state={{ message: "Unauthorized access" }}
        replace
      />
    );
    // Or show an unauthorized component: return <UnauthorizedPage />;
  }

  return <Outlet />; // Render the child route component
};

export default ProtectedRoute;
