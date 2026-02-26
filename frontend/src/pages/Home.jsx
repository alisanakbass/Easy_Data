import React, { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import ProductCard from "../components/ProductCard";
import {
  PackageSearch,
  Loader2,
  AlertCircle,
  Search,
  ScanLine,
  Camera,
} from "lucide-react";

const Home = () => {
  const [manualBarcode, setManualBarcode] = useState("");
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const fetchProduct = async (barcode) => {
    setLoading(true);
    setError(null);
    setProductData(null);

    try {
      const BASE_URL = `http://${window.location.hostname}:8080`;
      const response = await fetch(`${BASE_URL}/api/v1/product/${barcode}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ürün bulunamadı!");
      }

      setProductData(result.data);
    } catch (err) {
      setError(err.message || "Sunucuya bağlanılırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (barcode) => {
    setShowScanner(false);
    fetchProduct(barcode);
  };

  const handleScanAgain = () => {
    setProductData(null);
    setError(null);
    setManualBarcode("");
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      fetchProduct(manualBarcode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Barkod Tarayıcı Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Logo & Başlık */}
      <div className="text-center mb-10 w-full max-w-md">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
            <PackageSearch size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            EasyData
          </h1>
        </div>
        <p className="text-text-light font-medium mt-3">
          Aradığınız ürünün barkodunu okutarak anında güncel fiyatını ve stok
          durumunu görün.
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col items-center justify-center min-h-[400px]">
        {/* Yükleniyor */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 w-full animate-pulse-fast">
            <Loader2
              className="animate-spin text-secondary mb-4 drop-shadow-md"
              size={56}
            />
            <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Fiyat Sorgulanıyor...
            </p>
            <p className="text-sm text-text-light mt-2 text-center font-medium">
              Lütfen bekleyin, güncel stok ve kampanya verileri çekiliyor.
            </p>
          </div>
        )}

        {/* Hata */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-xl glass-panel border-t-4 border-danger rounded-[2rem] shadow-xl w-full animate-pop-in text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 text-danger p-5 rounded-2xl mb-5 shadow-sm">
              <AlertCircle size={44} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
              Eyvah, bir sorun var!
            </h3>
            <p className="text-gray-500 mb-8 font-medium">{error}</p>
            <button
              onClick={handleScanAgain}
              className="bg-gray-900 text-white px-8 py-3.5 rounded-xl hover:bg-black transition-all font-bold w-full shadow-lg shadow-gray-900/20 active:scale-[0.98]"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Ürün Kartı */}
        {!loading && !error && productData && (
          <ProductCard
            productData={productData}
            onScanAgain={handleScanAgain}
          />
        )}

        {/* Ana Ekran: Buton + Barkod girişi */}
        {!loading && !error && !productData && (
          <div className="w-full flex flex-col gap-5 animate-fade-in">
            {/* Büyük Tarat Butonu */}
            <button
              onClick={() => setShowScanner(true)}
              className="group relative w-full bg-gradient-to-br from-primary to-secondary text-white py-6 px-8 rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all active:scale-[0.98] hover:shadow-primary/40 hover:shadow-2xl overflow-hidden"
            >
              {/* Parlama efekti */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Camera size={28} />
              </div>
              <div className="text-left">
                <p className="text-xl font-black tracking-tight leading-none">
                  Ürünü Tarat
                </p>
                <p className="text-sm font-medium text-white/70 mt-1">
                  Kameranla barkodu okut
                </p>
              </div>
              <ScanLine
                className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity"
                size={28}
              />
            </button>

            {/* Ayırıcı */}
            <div className="relative flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-sm font-medium text-gray-400">veya</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Manuel Barkod Girişi */}
            <form
              onSubmit={handleManualSubmit}
              className="bg-white p-4 rounded-2xl shadow-lg border border-gray-50 flex gap-2 w-full"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Barkod no girin..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!manualBarcode}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-3 rounded-xl shadow-md transition-colors font-medium whitespace-nowrap"
              >
                Sorgula
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
