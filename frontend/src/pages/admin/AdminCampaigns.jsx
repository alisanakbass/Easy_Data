import React, { useState, useEffect } from "react";
import { Tag, Plus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import CampaignModal from "../../components/admin/CampaignModal";
import Pagination from "../../components/admin/Pagination";

const ITEMS_PER_PAGE = 15;

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Fetch Campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/campaigns`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Kampanyalar getirilemedi.");
      }

      setCampaigns(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const totalPages = Math.ceil(campaigns.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kampanyayı silmek istediğinize emin misiniz?"))
      return;

    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/campaigns/${id}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Silme işlemi başarısız.");
      }

      setCampaigns(campaigns.filter((c) => c.id !== id));
      alert("Kampanya başarıyla silindi.");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const handleSaveCampaign = async (formData) => {
    try {
      const isEditing = !!editingCampaign;
      const method = isEditing ? "PUT" : "POST";
      const url = `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/campaigns`;
      const payload = isEditing
        ? { ...formData, id: editingCampaign.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "İşlem başarısız.");
      }

      await fetchCampaigns();
      setIsModalOpen(false);
      setEditingCampaign(null);
      alert(
        isEditing
          ? "Kampanya başarıyla güncellendi."
          : "Kampanya başarıyla eklendi.",
      );
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in p-6 bg-white rounded-2xl shadow-sm border border-gray-50 min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
            <Tag size={24} />
          </div>
          Kampanya Yönetimi
        </h1>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Yeni Kampanya Ekle
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin text-pink-500 mb-4" size={40} />
          <p>Kampanyalar yükleniyor...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-danger p-6 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Tag className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg">Henüz hiç kampanya eklenmemiş.</p>
        </div>
      )}

      {!loading && !error && campaigns.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="py-4 px-6 font-medium first:rounded-tl-xl text-xs w-10">
                  ID
                </th>
                <th className="py-4 px-6 font-medium">Kampanya Adı</th>
                <th className="py-4 px-6 font-medium">Bitiş Tarihi</th>
                <th className="py-4 px-6 font-medium">İndirim</th>
                <th className="py-4 px-6 font-medium">Durum</th>
                <th className="py-4 px-6 font-medium text-right last:rounded-tr-xl">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCampaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    #{camp.id}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-800">
                    {camp.name}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(camp.end_date).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-6 font-bold text-pink-600">
                    {camp.discount_type === "percentage"
                      ? `%${camp.discount_value}`
                      : `₺${camp.discount_value}`}
                  </td>
                  <td className="py-4 px-6">
                    {new Date(camp.end_date) > new Date() ? (
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                        Süresi Doldu
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCampaign(camp);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={campaigns.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {isModalOpen && (
        <CampaignModal
          isOpen={isModalOpen}
          campaign={editingCampaign}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
};

export default AdminCampaigns;
