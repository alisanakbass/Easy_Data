import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Tag, Plus, Trash2, X, Loader2 } from "lucide-react";

const ProductCampaignModal = ({ isOpen, onClose, product }) => {
  const [campaigns, setCampaigns] = useState([]); // Tüm kampanyalar
  const [productCampaigns, setProductCampaigns] = useState([]); // Ürüne atanmış olanlar
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchCampaigns();
      fetchProductCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/campaigns`,
      );
      const result = await response.json();
      if (result.success) setCampaigns(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProductCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${product.id}/campaigns`,
      );
      const result = await response.json();
      if (result.success) setProductCampaigns(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignCampaign = async (campaignId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${product.id}/campaigns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaign_id: campaignId }),
        },
      );
      const result = await res.json();
      if (result.success) {
        fetchProductCampaigns(); // listeyi güncelle
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeCampaign = async (campaignId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${product.id}/campaigns/${campaignId}`,
        {
          method: "DELETE",
        },
      );
      const result = await res.json();
      if (result.success) {
        fetchProductCampaigns();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  // Henüz atanmamış aktif kampanyaları bul (Süresi geçmeyenler)
  const availableCampaigns = campaigns.filter(
    (c) =>
      !productCampaigns.find((pc) => pc.id === c.id) &&
      new Date(c.end_date) > new Date(),
  );

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-pop-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 text-pink-600 p-2 rounded-lg">
              <Tag size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Kampanya Atama</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-white border-b border-gray-100 flex-shrink-0">
          <p className="text-sm text-gray-500 mb-1">Seçili Ürün:</p>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">{product.name}</p>
            <span className="font-mono text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-600">
              {product.barcode}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Atanabilir Kampanyalar */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
              Uygun Kampanyalar (Aktif)
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {availableCampaigns.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Eklenebilecek aktif kampanya bulunmuyor.
                </p>
              ) : (
                availableCampaigns.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-pink-200 transition-colors bg-white"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {c.name}
                      </p>
                      <p className="text-xs text-pink-600 font-bold mt-0.5">
                        {c.discount_type === "percentage"
                          ? `%${c.discount_value}`
                          : `₺${c.discount_value}`}{" "}
                        indirim
                      </p>
                    </div>
                    <button
                      onClick={() => assignCampaign(c.id)}
                      disabled={loading}
                      className="p-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold px-3"
                    >
                      <Plus size={14} /> Ekle
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Atanmış Kampanyalar */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Ürüne Uygulanan Kampanyalar
            </h3>

            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : productCampaigns.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                Bu ürüne atanmış kampanya yok.
              </div>
            ) : (
              <div className="space-y-2">
                {productCampaigns.map((c) => {
                  const isExpired = new Date(c.end_date) < new Date();
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between p-3 border rounded-xl ${isExpired ? "border-gray-200 bg-gray-50" : "border-green-100 bg-green-50/30"}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium text-sm ${isExpired ? "text-gray-500 line-through" : "text-gray-800"}`}
                          >
                            {c.name}
                          </p>
                          {isExpired && (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">
                              Süresi Bitti
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold mt-0.5 ${isExpired ? "text-gray-400" : "text-green-600"}`}
                        >
                          {c.discount_type === "percentage"
                            ? `%${c.discount_value}`
                            : `₺${c.discount_value}`}{" "}
                          indirim
                        </p>
                      </div>
                      <button
                        onClick={() => removeCampaign(c.id)}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                        title="Kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProductCampaignModal;
