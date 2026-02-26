import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  DollarSign,
  Layers,
  Tag,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import ProductModal from "../../components/admin/ProductModal";
import PriceModal from "../../components/admin/PriceModal";
import InventoryModal from "../../components/admin/InventoryModal";
import ProductCampaignModal from "../../components/admin/ProductCampaignModal";
import BulkPriceModal from "../../components/admin/BulkPriceModal";
import ExcelImportModal from "../../components/admin/ExcelImportModal";
import Pagination from "../../components/admin/Pagination";

const ITEMS_PER_PAGE = 20;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Price Modal State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [pricingProduct, setPricingProduct] = useState(null);

  // Inventory Modal State
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryProduct, setInventoryProduct] = useState(null);

  // Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignProduct, setCampaignProduct] = useState(null);

  // Bulk Price Modal State
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  // Excel Import Modal State
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const openCampaignModal = (product) => {
    setCampaignProduct(product);
    setIsCampaignModalOpen(true);
  };

  // Ürünleri Backend'den Çekme
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ürünler getirilemedi.");
      }

      setProducts(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Arama + Sayfalama Hesapları
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)),
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // aramada ilk sayfaya dön
  };

  // Ürün Silme İşlemi
  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(
        `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${id}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Silme işlemi başarısız.");
      }

      // Silinen ürünü state'ten de çıkaralım ki tablo güncellensin
      setProducts(products.filter((p) => p.id !== id));
      alert("Ürün başarıyla silindi.");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  // Ürün Kaydetme/Güncelleme
  const handleSaveProduct = async (
    formData,
    initialPrice,
    locationId,
    initialStock,
  ) => {
    try {
      const isEditing = !!editingProduct;
      const method = isEditing ? "PUT" : "POST";
      const url = `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products`;

      const payload = isEditing
        ? { ...formData, id: editingProduct.id }
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

      const newProductId = result.data?.id;

      // Yeni ürün için başlangıç fiyatı ekle
      if (!isEditing && initialPrice && newProductId) {
        await fetch(
          `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${newProductId}/price`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: initialPrice, currency: "TRY" }),
          },
        );
      }

      // Yeni ürün için başlangıç stok ekle
      if (!isEditing && initialStock && locationId && newProductId) {
        await fetch(
          `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${newProductId}/inventory`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location_id: parseInt(locationId),
              quantity: initialStock,
            }),
          },
        );
      }

      await fetchProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openPriceModal = (product) => {
    setPricingProduct(product);
    setIsPriceModalOpen(true);
  };

  const openInventoryModal = (product) => {
    setInventoryProduct(product);
    setIsInventoryModalOpen(true);
  };

  // Fiyat Ekleme İşlemi (POST)
  const handleSavePrice = async (priceValue) => {
    try {
      const url = `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080/api/v1/admin/products/${pricingProduct.id}/price`;
      const payload = {
        price: priceValue,
        currency: "TRY",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Fiyat güncellenemedi.");
      }

      setIsPriceModalOpen(false);
      setPricingProduct(null);
      // Şu aşamada tablodaki veriyi yenilesek de tabloda fiyat kolonu yok,
      // ancak işin doğrusu verileri baştan çekmektir.
      await fetchProducts();
      alert("Fiyat başarıyla güncellendi.");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in p-6 bg-white rounded-2xl shadow-sm border border-gray-50 min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-primary rounded-lg">
            <Package size={24} />
          </div>
          Ürün Yönetimi
          <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {filteredProducts.length} ürün
          </span>
        </h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Ürün veya barkod ara..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm font-medium"
            />
          </div>
          <button
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <DollarSign size={18} className="text-emerald-500" />
            <span className="hidden sm:inline">Toplu Zam</span>
          </button>
          <button
            onClick={() => setIsExcelImportOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <FileSpreadsheet size={18} className="text-violet-500" />
            <span className="hidden sm:inline">Excel'den Aktar</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Yeni Ürün</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p>Ürünler yükleniyor...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-danger p-6 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg">Henüz hiç ürün eklenmemiş.</p>
        </div>
      )}

      {!loading && !error && paginatedProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="py-4 px-6 font-medium first:rounded-tl-xl">
                  ID
                </th>
                <th className="py-4 px-6 font-medium">Barkod</th>
                <th className="py-4 px-6 font-medium">Ürün Adı</th>
                <th className="py-4 px-6 font-medium">Kategori</th>
                <th className="py-4 px-6 font-medium">Fiyat</th>
                <th className="py-4 px-6 font-medium text-right last:rounded-tr-xl">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    #{product.id}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
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
                  <td className="py-4 px-6 font-medium text-green-600">
                    {product.active_price
                      ? `₺${product.active_price.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openCampaignModal(product)}
                        className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Kampanya Yönetimi"
                      >
                        <Tag size={18} />
                      </button>
                      <button
                        onClick={() => openInventoryModal(product)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Stok Yönetimi"
                      >
                        <Layers size={18} />
                      </button>
                      <button
                        onClick={() => openPriceModal(product)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Fiyat Güncelle"
                      >
                        <DollarSign size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
            totalItems={filteredProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && searchQuery && (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Search className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg font-medium">
            "<strong>{searchQuery}</strong>" için sonuç bulunamadı.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
          >
            Aramayı Temizle
          </button>
        </div>
      )}

      {/* Ürün Ekleme/Düzenleme Modalı */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* Fiyat Güncelleme Modalı */}
      {isPriceModalOpen && pricingProduct && (
        <PriceModal
          isOpen={isPriceModalOpen}
          product={pricingProduct}
          onClose={() => setIsPriceModalOpen(false)}
          onSave={handleSavePrice}
        />
      )}

      {/* Stok Yönetimi Modalı */}
      {isInventoryModalOpen && inventoryProduct && (
        <InventoryModal
          isOpen={isInventoryModalOpen}
          product={inventoryProduct}
          onClose={() => {
            setIsInventoryModalOpen(false);
            setInventoryProduct(null);
            fetchProducts(); // Modal kapandığında tabloyu yenileyelim (stok verisi gelecekte eklenebilir)
          }}
        />
      )}

      {/* Kampanya Atama Modalı */}
      {isCampaignModalOpen && campaignProduct && (
        <ProductCampaignModal
          isOpen={isCampaignModalOpen}
          product={campaignProduct}
          onClose={() => {
            setIsCampaignModalOpen(false);
            setCampaignProduct(null);
            fetchProducts();
          }}
        />
      )}

      {/* Toplu Fiyat Güncelleme Modalı */}
      <BulkPriceModal
        isOpen={isBulkPriceModalOpen}
        onClose={() => setIsBulkPriceModalOpen(false)}
        onRefresh={fetchProducts}
        products={products}
      />

      {/* Excel ile Ürün Aktarma Modalı */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onRefresh={fetchProducts}
      />
    </div>
  );
};

export default AdminProducts;
