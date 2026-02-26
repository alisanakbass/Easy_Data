import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Loader2,
  Key,
} from "lucide-react";
import Pagination from "../../components/admin/Pagination";

const ITEMS_PER_PAGE = 12;

const StaffModal = ({ isOpen, onClose, fetchStaff, editingStaff }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingStaff) {
        setUsername(editingStaff.username);
        setFullName(editingStaff.full_name);
        setRole(editingStaff.role);
        setIsActive(editingStaff.is_active);
        setPassword(""); // Şifre boş gelir, istenirse yeni şifre atanır
      } else {
        setUsername("");
        setPassword("");
        setFullName("");
        setRole("staff");
        setIsActive(true);
      }
    }
  }, [isOpen, editingStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      username,
      full_name: fullName,
      role,
      is_active: isActive,
    };

    if (password) payload.password = password;

    try {
      const url = editingStaff
        ? `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/staff/${editingStaff.id}`
        : `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/staff`;
      const method = editingStaff ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchStaff();
        onClose();
      } else {
        alert("İşlem başarısız.");
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 animate-pop-in p-8 border border-white/20">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
            {editingStaff ? <Edit size={24} /> : <UserPlus size={24} />}
          </div>
          {editingStaff ? "Personel Düzenle" : "Yeni Personel Ekle"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              Tam Adı
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              placeholder="Örn: Ali Veli"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              placeholder="Örn: aliveli"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              {editingStaff
                ? "Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)"
                : "Şifre"}
            </label>
            <div className="relative">
              <input
                type="password"
                required={!editingStaff}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                placeholder="••••••••"
              />
              <Key
                className="absolute right-4 top-3.5 text-slate-300"
                size={20}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                Yetki
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-700 transition-all"
              >
                <option value="staff">Personel</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                Durum
              </label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-700 transition-all"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {editingStaff ? "Güncelle" : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/staff`);
      const result = await response.json();
      if (result.success) {
        setStaffList(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const totalPages = Math.ceil(staffList.length / ITEMS_PER_PAGE);
  const paginatedStaff = staffList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bu personeli silmek istediğinize emin misiniz?"))
      return;
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/staff/${id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Personel Yönetimi
          </h1>
          <p className="text-slate-500 font-medium">
            Market çalışanlarını ve yöneticileri buradan yönetebilirsiniz.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus size={22} />
          Yeni Personel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : staffList.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <Users className="mx-auto mb-4 text-slate-300" size={64} />
            <p className="text-slate-500 font-bold text-xl">
              Henüz personel kaydı bulunmuyor.
            </p>
          </div>
        ) : (
          paginatedStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-2xl ${staff.role === "admin" ? "bg-rose-100 text-rose-600" : "bg-sky-100 text-sky-600"}`}
                >
                  {staff.role === "admin" ? (
                    <Shield size={28} />
                  ) : (
                    <Users size={28} />
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingStaff(staff);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-black text-xl text-slate-800 mb-1">
                  {staff.full_name}
                </h3>
                <p className="text-slate-400 font-bold text-sm mb-4">
                  @{staff.username}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                      staff.role === "admin"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    {staff.role === "admin" ? "Yönetici" : "Personel"}
                  </span>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${staff.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                    ></div>
                    <span className="text-sm font-bold text-slate-600">
                      {staff.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={staffList.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fetchStaff={fetchStaff}
        editingStaff={editingStaff}
      />
    </div>
  );
};

export default AdminStaff;
