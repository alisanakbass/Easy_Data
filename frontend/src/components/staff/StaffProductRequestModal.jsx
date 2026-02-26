import React, { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  X,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";

/**
 * StaffProductRequestModal
 * Eksik ürün bildirimi için kullanılan modal.
 * Fotoğraf çekme, galeri yükleme ve barkod/stok bilgisi gönderme özelliklerine sahiptir.
 */
const StaffProductRequestModal = ({ isOpen, onClose, initialBarcode }) => {
  const [barcode, setBarcode] = useState(initialBarcode || "");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    console.log("startCamera başlatıldı");
    setCameraError(""); // Eski hatayı temizle

    // Check if the context is secure (HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      console.error("Güvenli olmayan bağlantı");
      setCameraError(
        "Kamera erişimi için HTTPS bağlantısı gereklidir. Lütfen güvenli bağlantı (https://) kullanın.",
      );
      return;
    }

    try {
      console.log("Kamera izinleri isteniyor...");
      // Kamera alanını hemen göster ki videoRef hazır olsun
      setIsCameraActive(true);

      // DOM'un güncellenmesi için çok kısa bir bekleme
      setTimeout(async () => {
        try {
          let stream;
          try {
            // Önce arka kamerayı dene
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" },
            });
            console.log("Arka kamera aktif");
          } catch (innerErr) {
            console.warn(
              "Arka kamera başarısız, varsayılan deneniyor:",
              innerErr,
            );
            // Herhangi bir kamerayı dene
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            console.log("Varsayılan kamera aktif");
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log("Stream video elementine bağlandı");
          } else {
            console.error("videoRef.current bulunamadı!");
            setCameraError("Kamera görüntüleme alanı oluşturulamadı.");
          }
        } catch (err) {
          console.error("MediaDevices Hatası:", err);
          setIsCameraActive(false);
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            setCameraError(
              "Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.",
            );
          } else {
            setCameraError("Kamera başlatılamadı: " + err.message);
          }
        }
      }, 100);
    } catch (err) {
      console.error("Genel Kamera Hatası:", err);
      setIsCameraActive(false);
      setCameraError("Kameraya erişilemedi.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          stopCamera();
        }
      }, "image/jpeg");
    }
  };

  const retakePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode || !stockQuantity) {
      setStatusMessage({
        type: "error",
        text: "Barkod ve stok miktarı zorunludur.",
      });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("barcode", barcode);
      formData.append("stock_quantity", stockQuantity);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/staff/product-requests`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();
      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "Talep başarıyla admine gönderildi!",
        });
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setStatusMessage({
          type: "error",
          text: result.error || "Bir hata oluştu.",
        });
      }
    } catch (error) {
      console.error("Gönderim hatası:", error);
      setStatusMessage({ type: "error", text: "Sunucu bağlantı hatası." });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBarcode(initialBarcode || "");
    setStockQuantity("1");
    setImageFile(null);
    setImagePreview(null);
    setStatusMessage({ type: "", text: "" });
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Eksik Ürün Bildirimi
            </h2>
            <p className="text-xs font-bold text-slate-400">
              Markette bulamadığınız ürünü kaydedin
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 sm:p-2.5 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto w-full flex-1">
          <form
            id="product-request-form"
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
          >
            {/* Barcode & Stock Row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Barkod
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 transition-all"
                  required
                />
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Stok (Raf)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 text-center transition-all"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Photo Section */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Ürün Fotoğrafı
              </label>

              {!imagePreview && !isCameraActive && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Kamera Aç tıklandı");
                      startCamera();
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors border border-indigo-100"
                  >
                    <Camera size={28} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Kamera Aç
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <ImageIcon size={28} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Galeri
                    </span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}

              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 z-10">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600 shadow-lg"
                    >
                      <X size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-white text-indigo-600 p-4 rounded-full border-4 border-indigo-200 hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      <Camera size={32} />
                    </button>
                  </div>
                </div>
              )}

              {imagePreview && (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="bg-white text-slate-700 p-3 rounded-xl hover:bg-slate-100 active:scale-95 font-bold flex items-center gap-2 shadow-lg"
                    >
                      <RefreshCw size={18} /> Yeniden Çek
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {cameraError && (
                <p className="text-xs font-bold text-rose-500 mt-2">
                  {cameraError}
                </p>
              )}
            </div>

            {/* Status Messages */}
            {statusMessage.text && (
              <div
                className={`p-3 rounded-xl text-sm font-bold ${statusMessage.type === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                {statusMessage.text}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              form="product-request-form"
              disabled={loading}
              className="flex-[2] bg-indigo-600 text-white font-black py-3 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={20} /> Admine Gönder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProductRequestModal;
