import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Save, Tag } from "lucide-react";

const CampaignModal = ({ isOpen, onClose, onSave, campaign = null }) => {
  const [formData, setFormData] = useState(
    () =>
      campaign || {
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
      },
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Parse string to number
    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };
    onSave(payload);
  };

  // Convert date for datetime-local input
  const formatForInput = (isoDateString) => {
    if (!isoDateString) return "";
    return new Date(isoDateString).toISOString().slice(0, 16);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-pop-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 text-pink-600 p-2 rounded-lg">
              <Tag size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {campaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Ekle"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kampanya Adı *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
              placeholder="Örn: Yılbaşı İndirimi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İndirim Tipi *
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm bg-white"
            >
              <option value="percentage">Yüzde (%)</option>
              <option value="fixed_amount">Sabit Tutar (TL)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İndirim Miktarı{" "}
              {formData.discount_type === "percentage" ? "(%)" : "(TL)"} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="discount_value"
              required
              value={formData.discount_value}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
              placeholder={
                formData.discount_type === "percentage" ? "15" : "50"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç *
              </label>
              <input
                type="datetime-local"
                name="start_date"
                required
                value={formatForInput(formData.start_date)}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş *
              </label>
              <input
                type="datetime-local"
                name="end_date"
                required
                value={formatForInput(formData.end_date)}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-xs"
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
              className="flex-1 px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {campaign ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default CampaignModal;
