import React from "react";
import {
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Tag,
  RefreshCcw,
} from "lucide-react";

const ProductCard = ({ productData, onScanAgain }) => {
  const {
    product,
    original_price,
    current_price,
    discount_name,
    is_critical_stock,
    total_stock,
  } = productData;

  const hasDiscount = original_price > current_price;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-pop-in">
      <div
        className={`p-6 text-white text-center rounded-b-[2rem] shadow-sm relative ${hasDiscount ? "bg-gradient-to-br from-accent to-red-500" : "bg-gradient-to-br from-secondary to-blue-600"}`}
      >
        <h2 className="text-2xl font-bold mb-1">{product.name}</h2>
        <p className="text-sm opacity-90">
          {product.category} - {product.unit_type}
        </p>

        <div className="mt-6 flex flex-col items-center justify-center">
          {hasDiscount && (
            <div className="text-lg line-through opacity-70 mb-1">
              {original_price.toFixed(2)} ₺
            </div>
          )}
          <div className="text-5xl font-extrabold tracking-tight">
            {current_price.toFixed(2)} <span className="text-2xl">₺</span>
          </div>
        </div>

        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-white text-accent text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Tag size={12} />
            {discount_name}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${is_critical_stock ? "bg-red-50 border-red-200 text-danger" : "bg-green-50 border-green-200 text-secondary"}`}
        >
          <div className="flex items-center gap-2">
            {is_critical_stock ? (
              <AlertTriangle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            <span className="font-semibold">
              {is_critical_stock ? "Kritik Stok Uyarı" : "Stok Durumu İyi"}
            </span>
          </div>
          <div className="font-bold text-lg">
            {total_stock} <span className="text-sm font-normal">Adet/Kg</span>
          </div>
        </div>

        {product.description && (
          <div className="text-sm text-text-light bg-gray-50 p-3 rounded-lg border border-gray-100 italic gap-2 flex">
            "{product.description}"
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={onScanAgain}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-text p-3 rounded-xl font-medium transition-colors"
          >
            <RefreshCcw size={18} />
            Yeni Tarama
          </button>

          <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white p-3 rounded-xl shadow-lg shadow-primary/30 font-medium transition-all transform hover:scale-105">
            <ShoppingCart size={18} />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
