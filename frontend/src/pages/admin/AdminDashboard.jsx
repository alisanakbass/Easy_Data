import React, { useState, useEffect } from "react";
import { Package, Tag, AlertTriangle, Loader2 } from "lucide-react";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`p-4 rounded-2xl ${color} shadow-inner`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-gray-800 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/dashboard/stats`,
        );
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("İstatistikler alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-fade-in">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-gray-500 font-medium">Panolar Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Genel Bakış</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Toplam Ürün"
          value={stats?.total_products || 0}
          icon={<Package size={28} className="text-emerald-600" />}
          color="bg-gradient-to-br from-emerald-50 to-emerald-100"
        />
        <StatCard
          title="Aktif Kampanyalar"
          value={stats?.active_campaigns || 0}
          icon={<Tag size={28} className="text-sky-600" />}
          color="bg-gradient-to-br from-sky-50 to-sky-100"
        />
        <StatCard
          title="Stoku Azalan Ürünler"
          value={stats?.low_stock_products || 0}
          icon={<AlertTriangle size={28} className="text-rose-600" />}
          color="bg-gradient-to-br from-rose-50 to-rose-100"
        />
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">
            Eklenen Son Ürünler
          </h2>
        </div>

        {stats?.recent_products && stats.recent_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-3 px-6 font-medium">Barkod</th>
                  <th className="py-3 px-6 font-medium">Ürün Adı</th>
                  <th className="py-3 px-6 font-medium">Kategori</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {product.barcode}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {product.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                        {product.category || "Belirtilmemiş"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Henüz hiç ürün eklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
