// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../pages/NotFoundPage";
import FileUploadPage from "../pages/FileUploadPage";
import ScheduleListPage from "../pages/ScheduleListPage";
import BatchFilesPage from "../pages/BatchFilesPage";
import ScheduleManagementPage from "../pages/ScheduleManagementPage";
import VerificationPage from "../pages/VerificationPage";
import AboutAppPage from "../pages/AboutAppPage"; // <-- New Import
import DeveloperStoryPage from "../pages/DeveloperStoryPage"; // <-- New Import
// ... (UserRole type if needed)

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about-app" element={<AboutAppPage />} />{" "}
      <Route path="/my-story" element={<DeveloperStoryPage />} />{" "}
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<FileUploadPage />} />
        <Route path="/schedules" element={<ScheduleListPage />} />
        <Route path="/batch/:batchId/files" element={<BatchFilesPage />} />
      </Route>
      {/* Routes for Staff (Professors, Batch Leaders, Admins) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["professor", "batch_leader"]} />
        }
      >
        {" "}
        {/* Or check user.is_staff if that's simpler */}
        <Route path="/manage/schedules" element={<ScheduleManagementPage />} />
        <Route path="/verify-uploads" element={<VerificationPage />} />
      </Route>
      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
