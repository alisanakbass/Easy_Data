import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div
      className="flex h-screen w-full"
      style={{ background: "var(--bg-base)" }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header
          className="shrink-0 h-16 flex items-center justify-end px-8 z-10"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-600/30">
              A
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Admin Kullanıcı
            </span>
          </div>
        </header>

        {/* İçerik */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
