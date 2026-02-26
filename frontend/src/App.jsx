import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Public Sayfalar
import Home from "./pages/Home";

// Auth Sayfası
import Login from "./pages/Login";

// Admin Sayfaları
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminLookups from "./pages/admin/AdminLookups";
import AdminProductRequests from "./pages/admin/AdminProductRequests";
import AdminLayout from "./components/admin/AdminLayout";

// Personel Sayfaları
import StaffHome from "./pages/staff/StaffHome";
import StaffLayout from "./components/staff/StaffLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Kullanıcıların gördüğü barkod okuma ana sayfası */}
        <Route path="/" element={<Home />} />

        {/* Ortak Giriş Sayfası */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/staff/login" element={<Navigate to="/login" replace />} />

        {/* Admin Paneli Ortak Yapısı ve Alt Sayfalar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="product-requests" element={<AdminProductRequests />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="lookups" element={<AdminLookups />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Personel Portalı */}
        <Route path="/staff/login" element={<Navigate to="/login" replace />} />
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/search" replace />} />
          <Route path="search" element={<StaffHome />} />
          {/* İhtiyaç halinde diğer personel sayfaları buraya */}
        </Route>

        {/* Bulunamayan tüm sayfalar için ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
