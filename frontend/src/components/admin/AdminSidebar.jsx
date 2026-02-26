import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PackageSearch,
  LayoutDashboard,
  Package,
  Tag,
  Settings,
  LogOut,
  Users,
  Database,
  ClipboardList,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      name: "Ürün Yönetimi",
      icon: <Package size={20} />,
      path: "/admin/products",
    },
    { name: "Personel", icon: <Users size={20} />, path: "/admin/staff" },
    {
      name: "Talepler",
      icon: <ClipboardList size={20} />,
      path: "/admin/product-requests",
    },
    { name: "Kampanyalar", icon: <Tag size={20} />, path: "/admin/campaigns" },
    {
      name: "Ürün Tanımları",
      icon: <Database size={20} />,
      path: "/admin/lookups",
    },
    { name: "Ayarlar", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  return (
    <div
      className="w-64 flex flex-col h-full"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Logo */}
      <div
        className="p-6 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-emerald-600/30">
          <PackageSearch size={24} />
        </div>
        <span
          className="text-xl font-black"
          style={{ color: "var(--text-primary)" }}
        >
          Admin Panel
        </span>
      </div>

      {/* Menü */}
      <div className="flex-1 py-6 flex flex-col gap-1 px-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-400 shadow-sm border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Çıkış */}
      <div
        className="p-4"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors font-semibold text-sm text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut size={20} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
