import { Routes, Route } from "react-router-dom";
import { HomePage } from "./features/members/HomePage";
import { RegisterPage } from "./features/members/RegisterPage";
import { LoginPage } from "./features/members/LoginPage";
import { DashboardPage } from "./features/members/DashboardPage";
import { BookingsPage } from "./features/bookings/BookingsPage";
import { DonationsPage } from "./features/donations/DonationsPage";
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminReportsPage } from "./features/admin/AdminReportsPage";
import { AdminBookingsPage } from "./features/admin/AdminBookingsPage";
import { AdminResourcesPage } from "./features/admin/AdminResourcesPage";
import { AdminDonationsPage } from "./features/admin/AdminDonationsPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminRoute } from "./routes/AdminRoute";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/donations" element={<DonationsPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminReportsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="resources" element={<AdminResourcesPage />} />
        <Route path="donations" element={<AdminDonationsPage />} />
      </Route>
    </Routes>
  );
}
