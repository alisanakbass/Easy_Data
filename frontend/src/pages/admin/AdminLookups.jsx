import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Database,
  Plus,
  Trash2,
  Loader2,
  Tag,
  Package,
  DollarSign,
  Layers,
  MapPin,
  Folder,
  FolderOpen,
  Edit,
  X,
  Save,
  ChevronRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   LOOKUP KARTI — Marka, Birim, Para Birimi, Raf, Alt Kategori
═══════════════════════════════════════════════════════════════ */
const LOOKUP_TYPES = [
  { type: "brand", label: "Markalar", icon: Tag, color: "indigo" },
  {
    type: "unit_type",
    label: "Birim Tipleri",
    icon: Package,
    color: "emerald",
  },
  {
    type: "currency",
    label: "Para Birimleri",
    icon: DollarSign,
    color: "amber",
  },
  {
    type: "sub_category",
    label: "Alt Kategoriler",
    icon: Layers,
    color: "violet",
  },
  { type: "shelf", label: "Raflar", icon: MapPin, color: "rose" },
];

const colorMap = {
  indigo: {
    grad: "from-indigo-600 to-indigo-700",
    btn: "bg-indigo-600 hover:bg-indigo-700",
  },
  emerald: {
    grad: "from-emerald-600 to-teal-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
  amber: {
    grad: "from-amber-500 to-orange-500",
    btn: "bg-amber-500 hover:bg-amber-600",
  },
  violet: {
    grad: "from-violet-600 to-purple-600",
    btn: "bg-violet-600 hover:bg-violet-700",
  },
  rose: {
    grad: "from-rose-600 to-pink-600",
    btn: "bg-rose-600 hover:bg-rose-700",
  },
};

const LookupCard = ({ config }) => {
  const [items, setItems] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = config.icon;
  const c = colorMap[config.color];

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/lookups?type=${config.type}`,
      );
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {
      /* sunucu kapalı */
    }
  }, [config.type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/lookups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: config.type, value: newValue.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          [...prev, data.data].sort((a, b) => a.value.localeCompare(b.value)),
        );
        setNewValue("");
      } else {
        alert(data.error || "Eklenemedi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu değeri silmek istediğinize emin misiniz?")) return;
    await fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/lookups/${id}`, {
      method: "DELETE",
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div
        className={`bg-gradient-to-r ${c.grad} px-6 py-5 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Icon size={18} className="text-white" />
          </div>
          <h3 className="font-black text-white">{config.label}</h3>
        </div>
        <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      <form
        onSubmit={handleAdd}
        className="px-5 py-3 flex gap-2 border-b border-slate-100 bg-slate-50"
      >
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Yeni ${config.label.replace(/ler$|lar$/, "").toLowerCase()} ekle...`}
          className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:border-indigo-400 text-sm font-medium transition-all"
        />
        <button
          type="submit"
          disabled={loading || !newValue.trim()}
          className={`${c.btn} text-white px-3 py-2 rounded-xl font-black text-sm transition-all disabled:opacity-40 flex items-center gap-1.5`}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Ekle
        </button>
      </form>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 max-h-[220px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-300">
            <Icon size={28} />
            <p className="mt-2 text-xs font-bold">Henüz kayıt yok</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between group px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-700">
                {item.value}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-all hover:bg-rose-50"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   KATEGORİ MODAL
═══════════════════════════════════════════════════════════════ */
const CategoryModal = ({
  isOpen,
  onClose,
  fetchCategories,
  editingCategory,
  allCategories,
}) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editingCategory?.name || "");
      setParentId(editingCategory?.parent_id || "");
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingCategory
        ? `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories/${editingCategory.id}`
        : `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories`;
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          parent_id: parentId ? parseInt(parentId) : null,
        }),
      });
      if (res.ok) {
        fetchCategories();
        onClose();
      } else {
        alert("İşlem başarısız oldu.");
      }
    } catch {
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-pop-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Folder size={20} className="text-white" />
            </div>
            <h2 className="font-black text-white text-lg">
              {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              Kategori Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all"
              placeholder="Örn: Elektronik"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              Üst Kategori
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:outline-none focus:border-emerald-500 text-sm font-medium transition-all"
            >
              <option value="">(Yok — Ana Kategori)</option>
              {allCategories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                  disabled={editingCategory && cat.id === editingCategory.id}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-2xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {editingCategory ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

/* ═══════════════════════════════════════════════════════════════
   KATEGORİ KARTI — Ağaç görünümü
═══════════════════════════════════════════════════════════════ */
const CategoryCard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expanded, setExpanded] = useState({});

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {
      /* sunucu kapalı */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?"))
      return;
    await fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories/${id}`, {
      method: "DELETE",
    });
    fetchCategories();
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderTree = (list, depth = 0) =>
    list.map((cat) => (
      <React.Fragment key={cat.id}>
        <div
          className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${depth > 0 ? "bg-slate-50/50" : ""}`}
          style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {cat.sub_categories?.length > 0 && (
              <button
                onClick={() => toggleExpand(cat.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform ${expanded[cat.id] ? "rotate-90" : ""}`}
                />
              </button>
            )}
            {!cat.sub_categories?.length && (
              <div className="w-[14px] shrink-0" />
            )}
            <div
              className={`p-1.5 rounded-xl shrink-0 ${depth === 0 ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"}`}
            >
              {depth === 0 ? <Folder size={14} /> : <FolderOpen size={12} />}
            </div>
            <div className="min-w-0">
              <p
                className={`font-bold text-slate-800 truncate ${depth > 0 ? "text-xs" : "text-sm"}`}
              >
                {cat.name}
              </p>
              {cat.sub_categories?.length > 0 && (
                <p className="text-[10px] text-slate-400 font-medium">
                  {cat.sub_categories.length} alt kategori
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => {
                setEditingCategory(cat);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit size={13} />
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        {cat.sub_categories?.length > 0 &&
          expanded[cat.id] &&
          renderTree(cat.sub_categories, depth + 1)}
      </React.Fragment>
    ));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:col-span-2 xl:col-span-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Folder size={18} className="text-white" />
          </div>
          <h3 className="font-black text-white">Kategoriler</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
            {categories.length}
          </span>
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-emerald-500" size={28} />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-300">
            <Folder size={32} />
            <p className="mt-2 text-xs font-bold">Henüz kategori yok</p>
          </div>
        ) : (
          <div className="flex flex-col">{renderTree(categories)}</div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        fetchCategories={fetchCategories}
        editingCategory={editingCategory}
        allCategories={categories}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ANA SAYFA
═══════════════════════════════════════════════════════════════ */
const AdminLookups = () => (
  <div className="animate-fade-in">
    {/* Başlık */}
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20">
          <Database size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Ürün Tanımları
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Kategoriler ve ürün ekleme formundaki dropdown değerlerini buradan
            yönetin
          </p>
        </div>
      </div>
      <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="text-sm text-indigo-700 font-medium leading-relaxed">
          Burada eklediğiniz{" "}
          <strong>
            kategoriler, markalar, birim tipleri, para birimleri, raflar ve alt
            kategoriler
          </strong>
          ; ürün ekleme / düzenleme formunda otomatik olarak öneri listesi
          olarak çıkar.
        </p>
      </div>
    </div>

    {/* Kartlar Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* Kategori kartı — tam genişlik veya 2 sütun */}
      <CategoryCard />
      {/* Diğer lookup kartları */}
      {LOOKUP_TYPES.map((cfg) => (
        <LookupCard key={cfg.type} config={cfg} />
      ))}
    </div>
  </div>
);

export default AdminLookups;
