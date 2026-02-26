import React, { useState, useEffect } from "react";
import {
  Search,
  Barcode,
  MapPin,
  Package,
  AlertCircle,
  Loader2,
  MoveRight,
  ArrowLeft,
  ChevronRight,
  Boxes,
  Tag,
  History,
  Info,
  X,
} from "lucide-react";
import StaffBarcodeScanner from "../../components/staff/StaffBarcodeScanner";
import StaffProductRequestModal from "../../components/staff/StaffProductRequestModal";

const StaffHome = () => {
  // Application State
  const [mode, setMode] = useState("menu"); // menu, search, stock, shelf
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState("");

  // Data States
  const [inventories, setInventories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [prices, setPrices] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Initialization
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/locations`,
      );
      const result = await response.json();
      if (result.success) setLocations(result.data || []);
    } catch (error) {
      console.error("Lokasyonlar yüklenemedi:", error);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/search?q=${query}`,
      );
      const result = await response.json();
      if (result.success) {
        setResults(result.data || []);
      }
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = async (productId) => {
    setLoading(true);
    try {
      // Get Inventory
      const invRes = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${productId}/inventory`,
      );
      const invData = await invRes.json();
      if (invData.success) setInventories(invData.data || []);

      // Get Price History
      const priceRes = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${productId}/prices`,
      );
      const priceData = await priceRes.json();
      if (priceData.success) setPrices(priceData.data || []);
    } catch (error) {
      console.error("Ürün detayları yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    getProductDetails(product.id);
  };

  const updateStock = async (locationId, quantity) => {
    setUpdating(true);
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${selectedProduct.id}/inventory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_id: locationId,
            quantity: parseFloat(quantity),
          }),
        },
      );
      if (response.ok) {
        getProductDetails(selectedProduct.id);
      }
    } catch (error) {
      console.error("Stok güncelleme hatası:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setQuery(decodedText);
    setShowScanner(false);
    // Trigger search directly after scan
    const fastSearch = async (barcode) => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/search?q=${barcode}`,
        );
        const result = await response.json();
        if (result.success) {
          setResults(result.data || []);
          // If only one product found, select it automatically
          if (result.data && result.data.length === 1) {
            handleSelectProduct(result.data[0]);
          } else if (result.data && result.data.length === 0) {
            // Barkod tarandı ama ürün bulunamadıysa modal için barkodu kaydet
            setNotFoundBarcode(barcode);
          }
        }
      } catch (error) {
        console.error("Tarama sonrası arama hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fastSearch(decodedText);
  };

  const resetState = () => {
    setMode("menu");
    setQuery("");
    setResults([]);
    setSelectedProduct(null);
    setNotFoundBarcode("");
  };

  const backToResults = () => {
    setSelectedProduct(null);
  };

  // UI Renders
  const renderMenu = () => (
    <div className="grid gap-4 sm:gap-6 animate-fade-in px-2">
      <div className="text-center mb-2 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
          Hoş Geldiniz
        </h2>
        <p className="text-slate-500 font-bold text-sm">
          Yapmak istediğiniz işlemi seçin
        </p>
      </div>

      <button
        onClick={() => setMode("search")}
        className="group bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] shadow-xl shadow-indigo-600/5 border border-slate-100 flex items-center gap-4 sm:gap-6 hover:border-indigo-200 transition-all active:scale-95 text-left"
      >
        <div className="bg-blue-100 text-blue-600 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
          <Search size={28} className="sm:w-8 sm:h-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            Ürün Sorgulama
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-400 truncate">
            Fiyat ve genel stok bilgisi
          </p>
        </div>
        <ChevronRight className="text-slate-300 shrink-0" size={20} />
      </button>

      <button
        onClick={() => setMode("stock")}
        className="group bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] shadow-xl shadow-indigo-600/5 border border-slate-100 flex items-center gap-4 sm:gap-6 hover:border-amber-200 transition-all active:scale-95 text-left"
      >
        <div className="bg-amber-100 text-amber-600 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
          <Boxes size={28} className="sm:w-8 sm:h-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            Stok Güncelleme
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-400 truncate">
            Depo ve raf adetlerini düzenle
          </p>
        </div>
        <ChevronRight className="text-slate-300 shrink-0" size={20} />
      </button>

      <button
        onClick={() => setMode("shelf")}
        className="group bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] shadow-xl shadow-indigo-600/5 border border-slate-100 flex items-center gap-4 sm:gap-6 hover:border-emerald-200 transition-all active:scale-95 text-left"
      >
        <div className="bg-emerald-100 text-emerald-600 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
          <MapPin size={28} className="sm:w-8 sm:h-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            Raf Düzenleme
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-400 truncate">
            Ürünlerin reyon konumlarını yönet
          </p>
        </div>
        <ChevronRight className="text-slate-300 shrink-0" size={20} />
      </button>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 px-2">
        <button
          onClick={resetState}
          className="bg-white p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 shrink-0"
        >
          <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight truncate">
          {mode === "search" && "Ürün Sorgulama"}
          {mode === "stock" && "Stok Güncelleme"}
          {mode === "shelf" && "Raf Düzenleme"}
        </h2>
      </div>

      <div className="px-2 space-y-4">
        <div className="relative group">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ismi veya barkod..."
              className="w-full bg-white px-5 sm:px-6 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] border-none shadow-xl shadow-indigo-600/5 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800 pr-28 sm:pr-32 text-sm sm:text-base"
            />
            <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="bg-slate-100 text-slate-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-colors"
                title="Barkod Tarat"
              >
                <Barcode size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Search size={20} className="sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {selectedProduct ? (
        renderProductAction()
      ) : (
        <>
          {/* Scanner UI */}
          {showScanner && (
            <StaffBarcodeScanner
              onScanSuccess={handleScanSuccess}
              onClose={() => setShowScanner(false)}
            />
          )}

          <div className="space-y-3">
            {results.length > 0 && (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">
                BULUNAN SONUÇLAR ({results.length})
              </p>
            )}
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">
                    <Package size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                      <Barcode size={14} /> {product.barcode}
                    </p>
                  </div>
                </div>
                <div className="text-indigo-500">
                  <ChevronRight size={24} />
                </div>
              </div>
            ))}
            {query && !loading && results.length === 0 && (
              <div className="text-center py-10">
                <AlertCircle
                  className="mx-auto text-slate-300 mb-2"
                  size={48}
                />
                <p className="text-slate-500 font-bold mb-4">
                  Ürün bulunamadı.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setNotFoundBarcode(query);
                    setShowRequestModal(true);
                  }}
                  className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm"
                >
                  Admine Bildir
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderProductAction = () => {
    const totalStock = inventories.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const activePrice = prices.find((p) => p.is_active)?.price || 0;

    return (
      <div className="animate-fade-in space-y-4 sm:space-y-6 pb-20 sm:pb-12 px-2">
        <button
          onClick={backToResults}
          className="text-xs sm:text-sm font-black text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all py-1"
        >
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Arama Sonuçlarına
          Dön
        </button>

        {/* Product Details Header */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-indigo-600/5 border border-slate-50">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-indigo-600 text-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shrink-0">
                <Package size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black text-slate-800 leading-tight truncate">
                  {selectedProduct.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    {selectedProduct.barcode}
                  </span>
                  <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    {selectedProduct.unit_type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-center flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                  Fiyat
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-800">
                  ₺
                  {activePrice.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-center flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                  Toplam Stok
                </p>
                <p
                  className={`text-xl sm:text-2xl font-black ${totalStock <= selectedProduct.critical_stock_level ? "text-rose-500" : "text-emerald-500"}`}
                >
                  {totalStock}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Specific Body */}
        {mode === "search" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-black text-sm sm:text-base text-slate-800 flex items-center gap-2 mb-4 sm:mb-6">
                <Info size={18} className="text-indigo-500 sm:w-5 sm:h-5" />
                Ürün Bilgileri
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">
                    Kategori
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-800 truncate">
                    {selectedProduct.category || "Belirtilmemiş"}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">
                    Kritik Stok
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    {selectedProduct.critical_stock_level}{" "}
                    {selectedProduct.unit_type}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-black text-sm sm:text-base text-slate-800 flex items-center gap-2 mb-4 sm:mb-6">
                <MapPin size={18} className="text-indigo-500 sm:w-5 sm:h-5" />
                Konumlardaki Dağılım
              </h4>
              <div className="space-y-2.5 sm:space-y-3">
                {inventories.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`${inv.location.type === "shelf" ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"} p-2 rounded-lg sm:rounded-xl`}
                      >
                        {inv.location.type === "shelf" ? (
                          <Tag size={16} className="sm:w-[18px] sm:h-[18px]" />
                        ) : (
                          <Package
                            size={16}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                        )}
                      </div>
                      <span className="text-sm sm:text-base font-bold text-slate-700">
                        {inv.location.name}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-slate-800">
                      {inv.quantity} {selectedProduct.unit_type}
                    </span>
                  </div>
                ))}
                {inventories.length === 0 && (
                  <p className="text-center text-slate-400 font-bold py-4 text-sm">
                    Herhangi bir konumda stok bulunamadı.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {(mode === "stock" || mode === "shelf") && (
          <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-indigo-600/5 border border-slate-50">
            <h4 className="font-black text-sm sm:text-base text-slate-800 flex items-center gap-2 mb-5 sm:mb-6 uppercase tracking-wider">
              {mode === "stock" ? (
                <Boxes size={18} className="text-amber-500 sm:w-5 sm:h-5" />
              ) : (
                <MapPin size={18} className="text-emerald-500 sm:w-5 sm:h-5" />
              )}
              {mode === "stock"
                ? "Stok Miktarlarını Güncelle"
                : "Reyon Konumlarını Güncelle"}
            </h4>

            <div className="grid gap-3 sm:gap-4">
              {locations
                .filter((loc) => mode === "stock" || loc.type === "shelf")
                .map((loc) => {
                  const inv = inventories.find((i) => i.location_id === loc.id);
                  return (
                    <div
                      key={loc.id}
                      className="bg-slate-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between gap-3 sm:gap-4 border border-transparent hover:border-slate-200 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-black text-slate-800 truncate">
                          {loc.name}
                        </p>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-slate-400">
                          {loc.type === "shelf"
                            ? "Raf / Reyon"
                            : "Depo / Arka Alan"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            disabled={updating}
                            defaultValue={inv ? inv.quantity : 0}
                            onBlur={(e) => updateStock(loc.id, e.target.value)}
                            className="w-20 sm:w-24 bg-white border-2 border-slate-100 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-center text-sm sm:text-base font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm disabled:opacity-50"
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-slate-400 w-6 sm:w-8 shrink-0">
                          {selectedProduct.unit_type}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 bg-indigo-50 rounded-xl sm:rounded-2xl flex gap-3 text-indigo-700">
              <Info size={18} className="shrink-0 sm:w-5 sm:h-5" />
              <p className="text-[10px] sm:text-xs font-bold leading-relaxed">
                Adet kısmını değiştirdiğinde otomatik kaydedilir.{" "}
                <br className="hidden sm:block" />
                Dışarı tıkladığında güncelleme yapılır.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      {mode === "menu" ? renderMenu() : renderSearch()}

      <StaffProductRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        initialBarcode={notFoundBarcode}
      />
    </div>
  );
};

export default StaffHome;
