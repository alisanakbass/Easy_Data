import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import ProductModal from "../../components/admin/ProductModal";

const AdminProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Model state for creating new product from request
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productInitialData, setProductInitialData] = useState(null);

  // Modal to show full image
  const [viewImage, setViewImage] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/product-requests?status=${statusFilter}`,
      );
      const result = await response.json();
      if (result.data) {
        setRequests(result.data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Talepler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (id, status, notes = "") => {
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/product-requests/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes }),
        },
      );
      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setProductInitialData({
      barcode: request.barcode,
      critical_stock_level: 10, // default
    });
    setIsProductModalOpen(true);
  };

  // Triggered when a product is saved successfully from ProductModal
  const handleProductSaved = async () => {
    // Product created successfully, now update request status and maybe add inventory
    if (selectedRequest) {
      await handleUpdateStatus(
        selectedRequest.id,
        "approved",
        "Sisteme eklendi.",
      );
      setIsProductModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Eksik Ürün Talepleri
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">
            Personelin markette bulamayıp bildirdiği ürünleri yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "pending" ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Bekleyenler
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "approved" ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Onaylananlar
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "rejected" ? "bg-rose-100 text-rose-700" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Reddedilenler
          </button>
          <button
            onClick={fetchRequests}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg ml-2"
            title="Yenile"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-400 p-8">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-black">
              {statusFilter === "pending"
                ? "Bekleyen talep yok"
                : "Kayıt bulunamadı"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Görsel</th>
                  <th className="p-4">Barkod</th>
                  <th className="p-4">Bildirilen Stok</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      {req.image_url ? (
                        <button
                          onClick={() => setViewImage(req.image_url)}
                          className="relative group rounded-lg overflow-hidden border border-slate-200 block w-16 h-16"
                        >
                          <img
                            src={`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080${req.image_url}`}
                            alt="Ürün"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="text-white" size={20} />
                          </div>
                        </button>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{req.barcode}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        {req.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-semibold">
                      {new Date(req.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="p-4">
                      {req.status === "pending" && (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Bekliyor
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Onaylandı
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Red
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {req.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                req.id,
                                "rejected",
                                "Admin tarafından iptal edildi",
                              )
                            }
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Reddet"
                          >
                            <XCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors"
                          >
                            <Plus size={16} /> Kaydet
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image View Modal (Lightbox) */}
      {viewImage && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-2 shadow-2xl">
            <button
              onClick={() => setViewImage(null)}
              className="absolute -top-4 -right-4 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <XCircle size={24} />
            </button>
            <img
              src={`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080${viewImage}`}
              alt="Büyük Görsel"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Product Creation Modal (Reusing existing components where possible) */}
      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductInitialData(null);
          }}
          selectedProduct={null} // We are creating a new one
          initialBarcode={productInitialData?.barcode}
          onSuccess={handleProductSaved}
        />
      )}
    </div>
  );
};

export default AdminProductRequests;
