import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Save, Tag } from "lucide-react";

const PriceModal = ({ isOpen, onClose, onSave, product }) => {
  const [price, setPrice] = useState("");

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || isNaN(price)) {
      alert("Lütfen geçerli bir fiyat giriniz.");
      return;
    }
    // API, string yerine number beklediği için parseFloat yapıyoruz
    onSave(parseFloat(price));
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-pop-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <Tag size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Fiyatı Güncelle</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Seçili Ürün:</p>
          <p className="font-semibold text-gray-800">{product.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-1">
            {product.barcode}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Fiyat (TL) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r border-gray-200 pr-3">
                ₺
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default PriceModal;
