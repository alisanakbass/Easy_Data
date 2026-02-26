import React, { useState } from "react";
import { Settings, Save, Store, Bell, Shield, Paintbrush } from "lucide-react";

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    storeName: "EasyData Mağazası",
    contactEmail: "iletisim@easydata.com",
    currency: "TRY",
    lowStockThreshold: "10",
    themePrimaryColor: "#f97316",
    enableNotifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Ayarlar başarıyla kaydedildi!");
    }, 1000);
  };

  const NAV = [
    { id: "general", label: "Genel Ayarlar", icon: Store },
    { id: "appearance", label: "Görünüm & Tema", icon: Paintbrush },
    { id: "notifications", label: "Bildirimler", icon: Bell },
    { id: "security", label: "Güvenlik & API", icon: Shield },
  ];

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white";

  return (
    <div className="animate-fade-in p-6 bg-white rounded-2xl shadow-sm border border-gray-50 min-h-[500px]">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-gray-100 text-gray-700 rounded-lg">
            <Settings size={28} />
          </div>
          Sistem Ayarları
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Menü */}
        <div className="col-span-1 border-r border-gray-100 pr-4">
          <nav className="space-y-2">
            {NAV.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-800 font-bold shadow-sm border border-emerald-100/50"
                      : "hover:bg-slate-50 text-slate-600 font-medium"
                  }`}
                >
                  <ItemIcon
                    size={20}
                    className={
                      activeTab === item.id
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sağ İçerik */}
        <div className="col-span-1 lg:col-span-2">
          {/* GENEL */}
          {activeTab === "general" && (
            <form className="space-y-8 max-w-2xl animate-fade-in">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Firma Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mağaza Adı
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İletişim E-Postası
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Sistem Parametreleri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Varsayılan Para Birimi
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="TRY">Türk Lirası (₺)</option>
                      <option value="USD">Dolar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genel Kritik Stok Seviyesi
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      min="0"
                      className={inputCls}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Bu limitin altına düşen ürünler dashboard'da görünür.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* GÖRÜNÜM */}
          {activeTab === "appearance" && (
            <div className="space-y-8 max-w-2xl animate-fade-in">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                  Ana Tema ve Renkler
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Mağazanızın müşteri tarafındaki ve yönetim panelindeki ana
                  kurumsal rengini buradan değiştirebilirsiniz.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ana Tema Rengi (Primary)
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      name="themePrimaryColor"
                      value={formData.themePrimaryColor}
                      onChange={handleChange}
                      className="w-14 h-14 p-1 rounded-lg border-2 border-gray-200 cursor-pointer bg-white"
                    />
                    <div>
                      <span className="font-mono text-gray-600">
                        {formData.themePrimaryColor}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Stiller .css dosyasından da desteklenebilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BİLDİRİMLER */}
          {activeTab === "notifications" && (
            <div className="space-y-8 max-w-2xl animate-fade-in">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                  E-Posta ve Uyarı Tercihleri
                </h3>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      name="enableNotifications"
                      checked={formData.enableNotifications}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800">
                      Stok Uyarılarını Aç
                    </span>
                    <p className="text-xs text-gray-500">
                      Ürün stoğu kritik seviyeye gelince yöneticilere günlük
                      mail atılır.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* GÜVENLİK */}
          {activeTab === "security" && (
            <div className="space-y-8 max-w-2xl animate-fade-in">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                  Güvenlik Ayarları
                </h3>
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3 mb-4">
                  <Shield className="mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-bold text-sm">Şifrenizi Değiştirin</p>
                    <p className="text-xs opacity-90 mt-1">
                      Admin hesabınızın şifresini belirli aralıklarla
                      değiştirmeniz tavsiye edilir.
                    </p>
                  </div>
                </div>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed mb-4"
                />
                <button className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Şifre Sıfırlama Bağlantısı Gönder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
