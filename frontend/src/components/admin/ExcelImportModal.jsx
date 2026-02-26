import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  Package,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Ürün şemasına göre CSV/Excel şablon sütunları
───────────────────────────────────────────────────────────── */
const COLUMNS = [
  {
    key: "name",
    label: "ADI",
    required: true,
    example: "12W S.A 3200K SPOT CATA CT5147G",
    desc: "Ürünün tam adı",
  },
  {
    key: "code",
    label: "KODU",
    required: false,
    example: "153.5922",
    desc: "Ürünün kodu",
  },
  {
    key: "category",
    label: "ANAGRUP",
    required: false,
    example: "HIRDAVAT",
    desc: "Ana kategori",
  },
  {
    key: "sub_category",
    label: "ALTGRUP",
    required: false,
    example: "SİLİKON",
    desc: "Alt kategori",
  },
  {
    key: "barcode",
    label: "BARKOD",
    required: true,
    example: "8680998220547",
    desc: "Benzersiz ürün barkodu",
  },
  {
    key: "price",
    label: "FİYAT",
    required: false,
    example: "15,00",
    desc: "Fiyat kaydı (boş bırakılabilir)",
  },
  {
    key: "currency",
    label: "DVZ",
    required: false,
    example: "Türk Lirası",
    desc: "Para Birimi",
  },
  {
    key: "magaza",
    label: "MAGAZA",
    required: false,
    example: "69,00",
    desc: "Mağaza Stok Miktarı",
  },
  {
    key: "depo",
    label: "DEPO",
    required: false,
    example: "0,00",
    desc: "Depo Stok Miktarı",
  },
  {
    key: "toplam",
    label: "TOPLAM",
    required: false,
    example: "69,00",
    desc: "Toplam Stok Miktarı (Bilgi Amaçlı)",
  },
];

/* ─────────────────────────────────────────────────────────────
   Örnek CSV içeriği oluştur
───────────────────────────────────────────────────────────── */
const generateTemplate = () => {
  const header = COLUMNS.map((c) => c.label).join(",");
  const example = COLUMNS.map((c) => c.example).join(",");
  const note = COLUMNS.map(
    (c) => `"(${c.required ? "Zorunlu" : "Opsiyonel"})"`,
  ).join(",");
  return `${header}\n${note}\n${example}\n`;
};

/* ─────────────────────────────────────────────────────────────
   Ana Bileşen
───────────────────────────────────────────────────────────── */
const ExcelImportModal = ({ isOpen, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("upload"); // upload | schema

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const downloadTemplate = () => {
    const blob = new Blob([generateTemplate()], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: "urun_aktarma_sablonu.csv",
    }).click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/import`,
        {
          method: "POST",
          body: fd,
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        onRefresh?.();
      } else setError(data.error || "İçe aktarma başarısız oldu.");
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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 size={44} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            İçe Aktarıldı!
          </h3>
          <div className="grid grid-cols-2 gap-3 my-6">
            {[
              {
                label: "Eklenen",
                val: result.created ?? result.count ?? "—",
                color: "text-emerald-400",
              },
              {
                label: "Hatalı",
                val: result.errors ?? 0,
                color: "text-rose-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-2xl"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {result.error_details?.length > 0 && (
            <div className="text-left mb-4 max-h-32 overflow-y-auto space-y-1">
              {result.error_details.map((e, i) => (
                <p
                  key={i}
                  className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl"
                >
                  {e}
                </p>
              ))}
            </div>
          )}
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

  /* ── Ana Panel ── */
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex animate-fade-in"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ════════ SOL PANEL ════════ */}
      <div
        className="w-[380px] shrink-0 flex flex-col h-full border-r"
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
            <div className="bg-violet-600/20 p-2 rounded-xl">
              <FileSpreadsheet size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="font-black text-white text-base">
                Excel ile Ürün Aktar
              </h2>
              <p className="text-xs text-slate-500">Toplu ürün içe aktarma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sekme */}
        <div className="flex px-5 pt-4 gap-2">
          {[
            { id: "upload", label: "Dosya Yükle" },
            { id: "schema", label: "Sütun Rehberi" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                tab === t.id
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/5 text-slate-500 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === "upload" ? (
            <>
              {/* Şablon indir */}
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed transition-all group hover:border-violet-500/50"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-surface-2)",
                }}
              >
                <div className="bg-violet-600/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                  <Download size={18} className="text-violet-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white">Şablon İndir</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Doğru formatlı CSV şablonu
                  </p>
                </div>
              </button>

              {/* Dosya yükleme alanı */}
              <div
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all group
                  ${file ? "border-violet-500/50 bg-violet-600/5" : "hover:border-violet-500/30"}`}
                style={!file ? { borderColor: "var(--border-color)" } : {}}
                onClick={() =>
                  document.getElementById("excel-import-input").click()
                }
              >
                <input
                  id="excel-import-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError(null);
                  }}
                />
                <div
                  className={`p-4 rounded-full mx-auto w-fit mb-3 transition-transform group-hover:scale-110
                  ${file ? "bg-violet-600/20 text-violet-400" : "bg-white/5 text-slate-500"}`}
                >
                  <Upload size={28} />
                </div>
                {file ? (
                  <>
                    <p className="text-sm font-black text-violet-400">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Değiştir
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-sm text-slate-300">
                      Dosyayı buraya sürükleyin
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Excel (.xlsx, .xls) veya CSV
                    </p>
                  </>
                )}
              </div>

              {/* Hata mesajı */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* Bilgi */}
              <div
                className="flex items-start gap-2 p-3 rounded-2xl text-xs text-slate-500"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <Info size={13} className="shrink-0 mt-0.5 text-indigo-400" />
                <p>
                  <span className="font-black text-slate-400">İpucu:</span>{" "}
                  Şablonu indirip doldurun.
                  <span className="text-rose-400 font-bold">
                    {" "}
                    BARKOD
                  </span> ve{" "}
                  <span className="text-rose-400 font-bold">ADI</span>{" "}
                  zorunludur. Diğer alanlar boş bırakılabilir.
                </p>
              </div>
            </>
          ) : (
            /* Sütun rehberi */
            <div className="space-y-2">
              {COLUMNS.map((col, i) => (
                <div
                  key={col.key}
                  className="p-3.5 rounded-2xl"
                  style={{
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-600 w-5">
                        {i + 1}.
                      </span>
                      <p className="text-sm font-black text-slate-200">
                        {col.label}
                      </p>
                      {col.required && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                          ZOR.
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {col.example}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-7">{col.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uygula */}
        {tab === "upload" && (
          <div
            className="p-5 border-t shrink-0"
            style={{ borderColor: "var(--border-color)" }}
          >
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-600/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              {loading ? "Aktarılıyor..." : "Ürünleri Aktar"}
            </button>
          </div>
        )}
      </div>

      {/* ════════ SAĞ PANEL — Sütun şeması görsel ════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div
          className="px-7 py-5 border-b shrink-0 flex items-center gap-3"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="bg-blue-600/20 p-2 rounded-xl">
            <Package size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-black text-white">Sütun Şeması</h3>
            <p className="text-xs text-slate-500">
              Dosyanızın{" "}
              <span className="font-bold text-slate-400">
                ilk satırı başlık
              </span>{" "}
              olmalıdır
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          {/* Görsel şema tablosu */}
          <div
            className="rounded-3xl overflow-hidden border"
            style={{ borderColor: "var(--border-color)" }}
          >
            {/* Başlık satırı */}
            <div
              className="px-4 py-3 flex gap-0 border-b text-xs"
              style={{
                background: "var(--bg-surface-2)",
                borderColor: "var(--border-color)",
              }}
            >
              {COLUMNS.map((col) => (
                <div
                  key={col.key}
                  className={`px-3 py-1 rounded font-black text-[10px] uppercase tracking-wide mr-1
                    ${col.required ? "bg-rose-500/15 text-rose-400" : "bg-white/5 text-slate-400"}`}
                >
                  {col.label}
                </div>
              ))}
            </div>
            {/* Örnek satır */}
            <div
              className="px-4 py-3 flex gap-0"
              style={{ background: "var(--bg-surface)" }}
            >
              {COLUMNS.map((col) => (
                <div key={col.key} className="mr-1 px-3 py-1">
                  <span className="text-xs font-mono text-emerald-400">
                    {col.example}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Açıklama listesi */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "var(--bg-surface)" }}
              >
                <ChevronRight
                  size={14}
                  className={
                    col.required
                      ? "text-rose-400 shrink-0 mt-0.5"
                      : "text-slate-600 shrink-0 mt-0.5"
                  }
                />
                <div>
                  <p className="text-sm font-black text-slate-200">
                    {col.label}
                    {col.required && (
                      <span className="ml-1.5 text-[9px] text-rose-400 font-black">
                        ZORUNLU
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{col.desc}</p>
                  <p className="text-xs font-mono text-indigo-400 mt-1">
                    Örn: {col.example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ExcelImportModal;
