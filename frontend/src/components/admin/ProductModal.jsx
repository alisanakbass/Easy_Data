import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Save,
  Package,
  Barcode,
  Tag,
  ChevronDown,
  Loader2,
} from "lucide-react";

// Lookup tipleri — bu sabitler artık sadece fallback olarak kullanılıyor
const DEFAULT_UNITS = ["Adet", "Kg", "Litre", "Gram", "Ml", "Paket", "Kutu"];
const DEFAULT_CURRENCIES = ["TRY", "USD", "EUR"];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-800 placeholder-slate-300";

const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  product = null,
  initialBarcode = "",
}) => {
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    brand: "",
    category: "",
    sub_category: "",
    unit_type: "Adet",
    shelf_code: "",
    description: "",
    critical_stock_level: 10,
  });
  const [initialPrice, setInitialPrice] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  // Lookup verileri
  const [brands, setBrands] = useState([]);
  const [unitTypes, setUnitTypes] = useState(DEFAULT_UNITS);
  const [subCategories, setSubCategories] = useState([]);
  const [shelves, setShelves] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          barcode: product.barcode || "",
          name: product.name || "",
          brand: product.brand || "",
          category: product.category || "",
          sub_category: product.sub_category || "",
          unit_type: product.unit_type || "Adet",
          shelf_code: product.shelf_code || "",
          description: product.description || "",
          critical_stock_level: product.critical_stock_level ?? 10,
        });
      } else {
        setFormData({
          barcode: initialBarcode || "",
          name: "",
          brand: "",
          category: "",
          sub_category: "",
          unit_type: "Adet",
          shelf_code: "",
          description: "",
          critical_stock_level: 10,
        });
        setInitialPrice("");
        setInitialStock("");
      }
      const fetchLookup = async (type, setter) => {
        try {
          const r = await fetch(
            `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/lookups?type=${type}`,
          );
          const d = await r.json();
          if (d.success && d.data?.length) setter(d.data.map((i) => i.value));
        } catch {
          /* API erişilemiyor, varsayılan değerler */
        }
      };
      fetchLookup("brand", setBrands);
      fetchLookup("unit_type", setUnitTypes);
      fetchLookup("sub_category", setSubCategories);
      fetchLookup("shelf", setShelves);

      // Konum/raf listesi
      fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/locations`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setLocations(d.data || []);
        })
        .catch(() => {});
    }
  }, [isOpen, product, initialBarcode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(
        formData,
        initialPrice ? parseFloat(initialPrice) : null,
        selectedLocation,
        initialStock ? parseFloat(initialStock) : null,
      );
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-pop-in border border-white/20">
        {/* Header */}
        <div className="shrink-0 px-8 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-2xl">
              <Package size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none">
                {product ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h2>
              <p className="text-indigo-200 text-xs font-bold mt-1">
                {product ? `ID: #${product.id}` : "Tüm bilgileri doldurun"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-6"
        >
          {/* Temel Bilgiler */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Barcode size={14} />
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Barkod Numarası" required>
                <input
                  type="text"
                  name="barcode"
                  required
                  value={formData.barcode}
                  onChange={handleChange}
                  className={`${inputCls} font-mono`}
                  placeholder="8690000000001"
                />
              </Field>
              <Field label="Ürün Adı" required>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Ülker Çikolatalı Gofret"
                />
              </Field>
              <Field label="Marka">
                <div className="relative">
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    list="brand-list"
                    className={inputCls}
                    placeholder="Ülker"
                  />
                  <datalist id="brand-list">
                    {brands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  />
                </div>
              </Field>
              <Field label="Raf Kodu">
                <div className="relative">
                  <input
                    type="text"
                    name="shelf_code"
                    value={formData.shelf_code}
                    onChange={handleChange}
                    list="shelf-list"
                    className={inputCls}
                    placeholder="A-12-3"
                  />
                  <datalist id="shelf-list">
                    {shelves.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Sınıflandırma */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tag size={14} />
              Sınıflandırma
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Kategori">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Atıştırmalık"
                />
              </Field>
              <Field label="Alt Kategori">
                <div className="relative">
                  <input
                    type="text"
                    name="sub_category"
                    value={formData.sub_category}
                    onChange={handleChange}
                    list="subcat-list"
                    className={inputCls}
                    placeholder="Çikolata"
                  />
                  <datalist id="subcat-list">
                    {subCategories.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  />
                </div>
              </Field>
              <Field label="Birim">
                <div className="relative">
                  <select
                    name="unit_type"
                    value={formData.unit_type}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none cursor-pointer`}
                  >
                    {unitTypes.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Fiyat & Stok (Sadece Yeni Ürün) */}
          {!product && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                💰 Başlangıç Fiyatı & Stok (Opsiyonel)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Başlangıç Fiyatı (₺)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(e.target.value)}
                    className={inputCls}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Miktar">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className={inputCls}
                    placeholder="0"
                  />
                </Field>
                <Field label="Konum">
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className={`${inputCls} appearance-none cursor-pointer`}
                    >
                      <option value="">Konum seçin</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.type})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Diğer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Kritik Stok Seviyesi">
              <input
                type="number"
                name="critical_stock_level"
                step="0.01"
                min="0"
                value={formData.critical_stock_level}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>
            <Field label="Açıklama">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={inputCls}
                placeholder="Opsiyonel not..."
              />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Kaydediliyor..." : product ? "Güncelle" : "Ürünü Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProductModal;
