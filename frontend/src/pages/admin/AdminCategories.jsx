import React, { useState, useEffect } from "react";
import { Folder, FolderPlus, Edit, Trash2, Plus, Loader2 } from "lucide-react";

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
      if (editingCategory) {
        setName(editingCategory.name);
        setParentId(editingCategory.parent_id || "");
      } else {
        setName("");
        setParentId("");
      }
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      parent_id: parentId ? parseInt(parentId) : null,
    };

    try {
      const url = editingCategory
        ? `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories/${editingCategory.id}`
        : `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchCategories();
        onClose();
      } else {
        alert("İşlem başarısız oldu.");
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
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 animate-fade-in p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori Adı
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              placeholder="Örn: Elektronik"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Üst Kategori
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="">(Yok - Ana Kategori)</option>
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {editingCategory ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories`,
      );
      const result = await response.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?"))
      return;
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/categories/${id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Tüm kategorileri düz bir listede göstermek için (Altı üstü ayırmadan veya ağaç yapısıyla)
  const renderCategoryTree = (categoriesList, depth = 0) => {
    return categoriesList.map((cat) => (
      <React.Fragment key={cat.id}>
        <div className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors bg-white">
          <div
            className="flex items-center gap-4"
            style={{ paddingLeft: `${depth * 2}rem` }}
          >
            <div
              className={`p-2 rounded-xl ${depth === 0 ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"}`}
            >
              {depth === 0 ? <Folder size={24} /> : <FolderPlus size={20} />}
            </div>
            <div>
              <p
                className={`font-bold text-gray-800 ${depth > 0 ? "text-sm" : "text-base"}`}
              >
                {cat.name}
              </p>
              {depth === 0 && (
                <p className="text-xs text-gray-500 font-medium">
                  Ana Kategori
                </p>
              )}
              {depth > 0 && (
                <p className="text-xs text-gray-500 font-medium">
                  Alt Kategori
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingCategory(cat);
                setIsModalOpen(true);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        {cat.sub_categories &&
          cat.sub_categories.length > 0 &&
          renderCategoryTree(cat.sub_categories, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Folder className="mx-auto mb-4 opacity-50 block" size={48} />
            Henüz hiç kategori eklenmemiş.
          </div>
        ) : (
          <div className="flex flex-col">{renderCategoryTree(categories)}</div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fetchCategories={fetchCategories}
        editingCategory={editingCategory}
        allCategories={categories} // Sadece üst seviye kategorileri veya düz listeyi geçebiliriz. Ana kategoriler için sadece categories
      />
    </div>
  );
};

export default AdminCategories;
