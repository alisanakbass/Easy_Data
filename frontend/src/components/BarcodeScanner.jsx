import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, Zap, AlertCircle } from "lucide-react";

/**
 * BarcodeScanner - Modern ve Mobil Uyumlu Modal Yapısı
 * z-index 99999 ile tüm arayüz bileşenlerinin (navbar dahil) üzerinde açılır.
 */
const BarcodeScanner = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    let html5QrCode = new Html5Qrcode("reader");
    let isScannerRunning = false;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 20,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.7);
              return {
                width: qrboxSize * 1.2,
                height: qrboxSize * 0.7,
              };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            if (isScannerRunning) {
              isScannerRunning = false;
              try {
                html5QrCode
                  .stop()
                  .then(() => html5QrCode.clear())
                  .catch(() => {});
              } catch {
                // Ignore errors
              }
            }
          },
          () => {},
        );
        isScannerRunning = true;
      } catch (err) {
        console.error("Kamera erişim hatası:", err);
      }
    };

    startScanner();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      if (isScannerRunning) {
        isScannerRunning = false;
        try {
          html5QrCode
            .stop()
            .then(() => html5QrCode.clear())
            .catch(() => {
              try {
                html5QrCode.clear();
              } catch {
                // ignore
              }
            });
        } catch {
          try {
            html5QrCode.clear();
          } catch {
            // ignore
          }
        }
      } else {
        try {
          html5QrCode.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [onScanSuccess]);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-transparent"
      style={{ isolation: "isolate" }}
    >
      {/* Backdrop: Arka planı bulanıklaştır ve hafif karart */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Container: Kart Tasarımı */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.25)] animate-pop-in border border-white/20 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight leading-none">
                Barkod Tarayıcı
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Canlı Görüntü
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-500 p-2 rounded-xl transition-all shadow-sm active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scanner Body: Kamera ve Tarama Alanı */}
        <div className="relative bg-slate-900 aspect-square overflow-hidden shrink-0">
          <div id="reader" className="w-full h-full"></div>

          {/* Overlay Katmanı */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Vizör (Viewfinder) Çerçevesi */}
            <div className="w-[80%] h-[45%] relative border-2 border-white/20 rounded-2xl">
              {/* Köşe Vurguları */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl"></div>

              {/* Lazer Tarama Animasyonu */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] animate-scan-line rounded-full"></div>

              {/* Merkez İpucu */}
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse rounded-2xl"></div>
            </div>

            {/* Karartılmış Çevre (Letterbox) */}
            <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
          </div>

          {/* İpucu Paneli */}
          <div className="absolute bottom-6 left-0 right-0 px-8">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Zap size={18} className="text-amber-400 shrink-0" />
              <p className="text-white text-[11px] font-bold leading-tight">
                Barkodu merkeze hizalayın, okuma işlemi otomatik olarak başlar.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer: Kontroller */}
        <div className="p-5 bg-white shrink-0 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
            <AlertCircle size={16} className="text-indigo-500 shrink-0" />
            <p className="text-[10px] font-bold text-slate-500 leading-tight">
              Yetersiz ışık durumunda telefon flaşını açabilirsiniz.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Taramayı Durdur ve Kapat
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default BarcodeScanner;
