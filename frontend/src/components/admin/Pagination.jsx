import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination - Yeniden kullanılabilir sayfalama bileşeni
 * @param {number} currentPage - Aktif sayfa (1'den başlar)
 * @param {number} totalPages  - Toplam sayfa sayısı
 * @param {number} totalItems  - Toplam kayıt sayısı
 * @param {number} itemsPerPage - Sayfa başına gösterilen kayıt sayısı
 * @param {function} onPageChange - Sayfa değişince çağrılan callback(pageNumber)
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Görünecek sayfa numaraları (en fazla 5 buton)
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
      {/* Kayıt Bilgisi */}
      <p className="text-sm text-gray-500 font-medium hidden sm:block">
        <span className="font-bold text-gray-800">
          {startItem}–{endItem}
        </span>{" "}
        / {totalItems} kayıt
      </p>
      <p className="text-xs text-gray-500 font-medium sm:hidden">
        {currentPage}/{totalPages} sayfa
      </p>

      {/* Sayfa Butonları */}
      <div className="flex items-center gap-1">
        {/* Önceki */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        {/* İlk sayfa + ... */}
        {getPageNumbers()[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              1
            </button>
            {getPageNumbers()[0] > 2 && (
              <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                …
              </span>
            )}
          </>
        )}

        {/* Sayfa numaraları */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
              page === currentPage
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            {page}
          </button>
        ))}

        {/* ... + Son sayfa */}
        {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
          <>
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                …
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Sonraki */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
