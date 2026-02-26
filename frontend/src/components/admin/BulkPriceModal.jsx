import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Filter,
  Percent,
  TrendingUp,
  TrendingDown,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Para formatı
───────────────────────────────────────────────────────────── */
const fmt = (v) =>
  Number(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ─────────────────────────────────────────────────────────────
   Önizleme satırı
───────────────────────────────────────────────────────────── */
const PreviewRow = ({ p, percentage }) => {
  const cur = p.current_price ?? 0;
  const pct = parseFloat(percentage) || 0;
  const nxt = cur * (1 + pct / 100);
  const diff = nxt - cur;
  const isUp = diff > 0;

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-5 py-3">
        <span className="text-xs font-mono text-slate-400">{p.barcode}</span>
      </td>
      <td className="px-5 py-3">
        <p className="text-sm font-bold text-slate-200 truncate max-w-[260px]">
          {p.name}
        </p>
        <p className="text-xs text-slate-500">{p.brand || "—"}</p>
      </td>
      <td className="px-5 py-3 text-right">
        <span className="text-sm font-bold text-slate-300">₺{fmt(cur)}</span>
      </td>
      <td className="px-5 py-3 text-right">
        {percentage !== "" ? (
          <span
            className={`text-sm font-black ${isUp ? "text-rose-400" : "text-emerald-400"}`}
          >
            ₺{fmt(nxt)}
          </span>
        ) : (
          <span className="text-slate-600 text-sm">—</span>
        )}
      </td>
      <td className="px-5 py-3 text-right">
        {percentage !== "" ? (
          <span
            className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl
            ${isUp ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"}`}
          >
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {isUp ? "+" : ""}
            {fmt(diff)}
          </span>
        ) : (
          <span className="text-slate-600 text-sm">—</span>
        )}
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────
   Ana Component — Yüzdesel Toplu Fiyat Güncelleme
───────────────────────────────────────────────────────────── */
const BulkPriceModal = ({ isOpen, onClose, onRefresh, products = [] }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [percentage, setPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setCategory("");
      setSubCategory("");
      setBrand("");
      setPriceMin("");
      setPriceMax("");
      setStockFilter("all");
      setPercentage("");
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );
  const subCategories = useMemo(
    () =>
      [...new Set(products.map((p) => p.sub_category).filter(Boolean))].sort(),
    [products],
  );
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (
          search &&
          !p.name?.toLowerCase().includes(search.toLowerCase()) &&
          !p.barcode?.includes(search)
        )
          return false;
        if (category && p.category !== category) return false;
        if (subCategory && p.sub_category !== subCategory) return false;
        if (brand && p.brand !== brand) return false;
        const price = p.current_price ?? 0;
        if (priceMin !== "" && price < parseFloat(priceMin)) return false;
        if (priceMax !== "" && price > parseFloat(priceMax)) return false;
        if (stockFilter === "zero" && (p.total_stock ?? 0) > 0) return false;
        if (stockFilter === "low" && (p.total_stock ?? 0) > 10) return false;
        return true;
      }),
    [
      products,
      search,
      category,
      subCategory,
      brand,
      priceMin,
      priceMax,
      stockFilter,
    ],
  );

  const activeFilters = [
    search,
    category,
    subCategory,
    brand,
    priceMin,
    priceMax,
    stockFilter !== "all",
  ].filter(Boolean).length;
  const pct = parseFloat(percentage) || 0;
  const isZam = pct > 0;

  const handleSubmit = async () => {
    if (!percentage || isNaN(pct) || pct === 0) {
      setError("Geçerli bir yüzde değeri girin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/bulk-price-percent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            percentage: pct,
            category,
            sub_category: subCategory,
            brand,
            price_min: priceMin ? parseFloat(priceMin) : undefined,
            price_max: priceMax ? parseFloat(priceMax) : undefined,
            barcodes: filtered.map((p) => p.barcode),
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        onRefresh?.();
      } else setError(data.error || "İşlem başarısız.");
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ── Sonuç Ekranı ── */
  if (result)
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div
          className="text-center max-w-sm w-full p-10 rounded-3xl border border-white/10 animate-pop-in shadow-2xl"
          style={{ background: "var(--bg-surface)" }}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5
          ${isZam ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}
          >
            {isZam ? <TrendingUp size={44} /> : <TrendingDown size={44} />}
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Tamamlandı!</h3>
          <p className="text-slate-400 mb-6">
            <span className="text-white font-black text-3xl">
              {result.count}
            </span>{" "}
            ürün güncellendi.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl font-black transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>,
      document.body,
    );

  /* ── Tam Ekran Panel ── */
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex animate-fade-in"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ════════ SOL PANEL — Filtreler ════════ */}
      <div
        className="w-[340px] shrink-0 flex flex-col h-full border-r overflow-y-auto"
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2 rounded-xl">
              <SlidersHorizontal size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="font-black text-white text-base">Toplu Fiyat</h2>
              <p className="text-xs text-slate-500">Güncelleme Merkezi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtreler */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Filtreler
            </span>
            {activeFilters > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
          </div>

          {/* Arama */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı veya barkod..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm font-medium transition-all"
              style={{
                background: "var(--bg-surface-2)",
                border: "2px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Dropdown filtreler */}
          {[
            {
              label: "Kategori",
              val: category,
              set: setCategory,
              opts: categories,
            },
            {
              label: "Alt Kategori",
              val: subCategory,
              set: setSubCategory,
              opts: subCategories,
            },
            { label: "Marka", val: brand, set: setBrand, opts: brands },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                {f.label}
              </label>
              <select
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: "var(--bg-surface-2)",
                  border: "2px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Tümü</option>
                {f.opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Fiyat aralığı */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Fiyat Aralığı (₺)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="Min"
                min="0"
                className="flex-1 px-3 py-2.5 rounded-2xl text-sm font-medium"
                style={{
                  background: "var(--bg-surface-2)",
                  border: "2px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              <span className="text-slate-600 text-xs font-bold">—</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="Max"
                min="0"
                className="flex-1 px-3 py-2.5 rounded-2xl text-sm font-medium"
                style={{
                  background: "var(--bg-surface-2)",
                  border: "2px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Stok durumu */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Stok Durumu
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "all", label: "Tümü" },
                { id: "low", label: "Az Stok" },
                { id: "zero", label: "Stoksuz" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStockFilter(s.id)}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    stockFilter === s.id
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-white/5 text-slate-500 hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setSubCategory("");
                setBrand("");
                setPriceMin("");
                setPriceMax("");
                setStockFilter("all");
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <RefreshCw size={12} /> Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Uygula bölümü */}
        <div
          className="p-5 border-t space-y-3 shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Yüzde input */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Değişim Yüzdesi
            </label>
            <div className="relative">
              <input
                type="number"
                value={percentage}
                onChange={(e) => {
                  setPercentage(e.target.value);
                  setError(null);
                }}
                placeholder="Zam: +10  |  İndirim: -10"
                className="w-full pr-10 pl-4 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: "var(--bg-surface-2)",
                  border: `2px solid ${pct > 0 ? "#f87171" : pct < 0 ? "#34d399" : "var(--border-color)"}`,
                  color: "var(--text-primary)",
                }}
              />
              <Percent
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
            {percentage !== "" && pct !== 0 && (
              <div
                className={`mt-2 flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-xl
                ${isZam ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}
              >
                {isZam ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isZam ? `+${pct}% Zam` : `${Math.abs(pct)}% İndirim`}{" "}
                uygulanacak
              </div>
            )}
          </div>

          {/* Özet */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex items-center gap-2">
              <Package size={15} className="text-indigo-400" />
              <span className="text-sm font-bold text-slate-300">
                Etkilenecek Ürün
              </span>
            </div>
            <span className="text-2xl font-black text-white">
              {filtered.length}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              loading || !percentage || pct === 0 || filtered.length === 0
            }
            className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl
              ${
                isZam
                  ? "bg-gradient-to-r from-rose-600 to-orange-600 shadow-rose-600/20"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20"
              } text-white disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isZam ? (
              <TrendingUp size={18} />
            ) : (
              <TrendingDown size={18} />
            )}
            {loading ? "Uygulanıyor..." : `${filtered.length} Ürüne Uygula`}
          </button>
        </div>
      </div>

      {/* ════════ SAĞ PANEL — Önizleme Tablosu ════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Önizleme Header */}
        <div
          className="px-7 py-5 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600/20 p-2 rounded-xl">
              <Eye size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-white">Canlı Önizleme</h3>
              <p className="text-xs text-slate-500">
                <span className="font-black text-slate-300">
                  {filtered.length}
                </span>{" "}
                ürün seçili · toplam {products.length} ürün
              </p>
            </div>
          </div>

          {/* Toplam özet */}
          {percentage !== "" && pct !== 0 && filtered.length > 0 && (
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase">
                  Toplam Mevcut
                </p>
                <p className="text-base font-black text-slate-300">
                  ₺
                  {fmt(
                    filtered.reduce((s, p) => s + (p.current_price ?? 0), 0),
                  )}
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-600" />
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase">
                  Toplam Yeni
                </p>
                <p
                  className={`text-base font-black ${isZam ? "text-rose-400" : "text-emerald-400"}`}
                >
                  ₺
                  {fmt(
                    filtered.reduce(
                      (s, p) => s + (p.current_price ?? 0) * (1 + pct / 100),
                      0,
                    ),
                  )}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-2xl text-sm font-black
                ${isZam ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
              >
                {isZam ? "+" : ""}
                {fmt(
                  filtered.reduce(
                    (s, p) => s + (p.current_price ?? 0) * (pct / 100),
                    0,
                  ),
                )}{" "}
                ₺ fark
              </div>
            </div>
          )}
        </div>

        {/* Tablo */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Package size={52} className="mb-4 opacity-20" />
              <p className="font-bold text-lg">Ürün bulunamadı</p>
              <p className="text-sm mt-1 text-slate-700">
                Filtreleri değiştirmeyi deneyin
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead
                className="sticky top-0 z-10"
                style={{
                  background: "var(--bg-surface-2)",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <tr>
                  {[
                    "Barkod",
                    "Ürün",
                    "Mevcut Fiyat",
                    "Yeni Fiyat",
                    "Değişim",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest ${i > 1 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PreviewRow key={p.id} p={p} percentage={percentage} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default BulkPriceModal;
