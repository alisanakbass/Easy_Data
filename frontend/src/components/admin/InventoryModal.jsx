import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Save, Layers, Loader2 } from "lucide-react";

const InventoryModal = ({ isOpen, onClose, product }) => {
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Form State
  const [selectedLocation, setSelectedLocation] = useState("");
  const [quantity, setQuantity] = useState("");

  // Mevcut Stoklar
  const [currentInventories, setCurrentInventories] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchLocations();
      fetchInventories();
    }
  }, [isOpen, product]);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const res = await fetch(`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/locations`);
      const result = await res.json();
      if (result.success) {
        setLocations(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchInventories = async () => {
    try {
      setLoadingInv(true);
      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${product.id}/inventory`,
      );
      const result = await res.json();
      if (result.success) {
        setCurrentInventories(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInv(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation || !quantity) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      const parsedLocationId = parseInt(selectedLocation, 10);
      const parsedQuantity = parseFloat(quantity);

      const res = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${product.id}/inventory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_id: parsedLocationId,
            quantity: parsedQuantity,
          }),
        },
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "İşlem başarısız.");
      }

      // Başarılı ise alanları temizle ve stok listesini yenile
      setQuantity("");
      fetchInventories();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  if (!isOpen || !product) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-pop-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Layers size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Stok Yönetimi</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm text-gray-500 mb-1">Seçili Ürün:</p>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">{product.name}</p>
            <span className="font-mono text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
              {product.barcode}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Yeni Stok Ekle/Güncelle Formu */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Stok Girişi / Güncelleme
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Lokasyon Seçin
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm bg-gray-50"
                  required
                  disabled={loadingLocations}
                >
                  <option value="">-- Depo/Raf --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
                {locations.length === 0 && !loadingLocations && (
                  <p className="text-[10px] text-red-500 mt-1">
                    Sistemde hiç lokasyon tanımlı değil.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Yeni Miktar (Adet/Kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium"
                  placeholder="Miktar"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={locations.length === 0}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                Kaydet
              </button>
            </div>
          </form>

          {/* Mevcut Stok Listesi */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Mevcut Stok Durumu
            </h3>

            {loadingInv ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : currentInventories.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                Bu ürüne ait henüz stok kaydı bulunmuyor.
              </div>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-2 px-4 font-medium text-gray-600">
                        Lokasyon
                      </th>
                      <th className="py-2 px-4 font-medium text-gray-600">
                        Tip
                      </th>
                      <th className="py-2 px-4 font-medium text-gray-600 text-right">
                        Miktar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInventories.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="py-2 px-4 font-medium text-gray-800">
                          {inv.location ? inv.location.name : "Bilinmiyor"}
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide font-medium">
                            {inv.location ? inv.location.type : "-"}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-orange-600">
                          {inv.quantity}{" "}
                          <span className="text-xs text-gray-400 font-normal">
                            {product.unit_type || "Adet"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default InventoryModal;
