import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  LogOut,
  User,
  LayoutGrid,
  MapPin,
} from "lucide-react";

const StaffLayout = () => {
  const navigate = useNavigate();
  const staff = JSON.parse(localStorage.getItem("staff_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <LayoutGrid size={24} />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                EasyStaff
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-black text-slate-800 leading-none">
                  {staff.full_name || "Personel"}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Saha Görevlisi
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24">
        <Outlet />
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 sm:hidden">
        <NavLink
          to="/staff/search"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-slate-400"}`
          }
        >
          <Search size={22} />
          <span className="text-[10px] font-black uppercase">Sorgula</span>
        </NavLink>
        <NavLink
          to="/staff/inventory"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-slate-400"}`
          }
        >
          <MapPin size={22} />
          <span className="text-[10px] font-black uppercase">Konum</span>
        </NavLink>
        <NavLink
          to="/staff/products"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-slate-400"}`
          }
        >
          <Package size={22} />
          <span className="text-[10px] font-black uppercase">Ürünler</span>
        </NavLink>
        <NavLink
          to="/staff/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-slate-400"}`
          }
        >
          <User size={22} />
          <span className="text-[10px] font-black uppercase">Profil</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default StaffLayout;
