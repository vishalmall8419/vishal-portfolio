import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { AdminThemeProvider } from "../context/AdminThemeContext";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layout/AdminLayout";

import AdminLogin from "../pages/Login/AdminLogin";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import Projects from "../pages/Projects/Projects";
import Blogs from "../pages/Blogs/Blogs";
import CrudPage from "../pages/CrudPage/CrudPage";
import Messages from "../pages/Messages/Messages";
import Newsletter from "../pages/Newsletter/Newsletter";
import Notifications from "../pages/Notifications/Notifications";
import Seo from "../pages/Seo/Seo";
import Theme from "../pages/Theme/Theme";
import Settings from "../pages/Settings/Settings";
import Gallery from "../pages/Gallery/Gallery";

export default function AdminRoutes() {
  return (
    <AdminThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="login" element={<AdminLogin />} />

            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="projects" element={<Projects />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="services" element={<CrudPage moduleKey="services" />} />
              <Route path="skills" element={<CrudPage moduleKey="skills" />} />
              <Route path="education" element={<CrudPage moduleKey="education" />} />
              <Route path="experience" element={<CrudPage moduleKey="experience" />} />
              <Route path="certificates" element={<CrudPage moduleKey="certificates" />} />
              <Route path="achievements" element={<CrudPage moduleKey="achievements" />} />
              <Route path="testimonials" element={<CrudPage moduleKey="testimonials" />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="messages" element={<Messages />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="seo" element={<Seo />} />
              <Route path="theme" element={<Theme />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </AdminThemeProvider>
  );
}
