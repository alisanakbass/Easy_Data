package handlers

import (
	"easydata/internal/models"
	"easydata/internal/services"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

// ProductHandler - Ürünlerle ilgili tüm API Istek Yöneticisi
type ProductHandler struct {
	service services.ProductService
}

// NewProductHandler - Handler başlatıcı
func NewProductHandler(service services.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// GetProductByBarcode - Barkoduna göre ürünün fiyat + stok + kampanya detaylarını getirir.
func (h *ProductHandler) GetProductByBarcode(c *gin.Context) {
	// 1. URL parametresinden barkodu al
	barcode := c.Param("barcode")
	if barcode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lütfen ürün barkodu giriniz."})
		return
	}

	// 2. Servis üzerinden Barkodu gönderip, işlenmiş (fiyat/stok/indirim hesaplanmış) datayı iste
	response, err := h.service.GetProductDetails(barcode)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Bu barkoda sahip bir ürün bulunamadı.",
			"detail": err.Error(),
		})
		return
	}

	// 3. Hesaplanan her şeyi başarılı ise Json olarak yolla (Müşteri ekranı için)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// GetAllProducts - Admin için tüm ürün listesini getirir
func (h *ProductHandler) GetAllProducts(c *gin.Context) {
	products, err := h.service.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ürünler getirilirken hata oluştu", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": products})
}

// CreateProduct - Admin için yeni ürün ekler
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	if err := h.service.CreateProduct(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ürün eklenemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": product})
}

// UpdateProduct - Admin için ürünü günceller
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	if err := h.service.UpdateProduct(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ürün güncellenemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// DeleteProduct - Admin için ürünü siler
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ID gerekli"})
		return
	}

	// id string'den uint'e çevirilmeli
	var parsedId uint
	_, err := fmt.Sscanf(id, "%d", &parsedId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ID formatı gerekli (sayı olmalı)"})
		return
	}

	if err := h.service.DeleteProduct(parsedId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ürün silinemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ürün başarıyla silindi"})
}

// AddProductPrice - Ürüne yeni fiyat ekler (geçmiş fiyatları pasif yapar)
func (h *ProductHandler) AddProductPrice(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "İşlem için ürün ID gerekli"})
		return
	}

	var parsedId uint
	_, err := fmt.Sscanf(id, "%d", &parsedId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ürün ID formatı gerekli (sayı olmalı)"})
		return
	}

	var price models.ProductPrice
	if err := c.ShouldBindJSON(&price); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz fiyat verisi", "detail": err.Error()})
		return
	}

	// ID'yi eşleştir
	price.ProductID = parsedId

	if err := h.service.AddProductPrice(&price); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fiyat eklenemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Fiyat başarıyla eklendi", "data": price})
}

// GetDashboardStats - Admin paneli için dashboard istatistiklerini getirir
func (h *ProductHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.service.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "İstatistikler alınamadı", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

// AddOrUpdateInventory - Seçili ürüne stok ekler / günceller
func (h *ProductHandler) AddOrUpdateInventory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "İşlem için ürün ID gerekli"})
		return
	}

	var parsedId uint
	_, err := fmt.Sscanf(id, "%d", &parsedId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ürün ID formatı gerekli (sayı olmalı)"})
		return
	}

	var inventory models.Inventory
	if err := c.ShouldBindJSON(&inventory); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz stok verisi", "detail": err.Error()})
		return
	}

	inventory.ProductID = parsedId

	if err := h.service.AddOrUpdateInventory(&inventory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stok eklenemedi/güncellenemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stok başarıyla kaydedildi"})
}

// GetProductInventory - Seçilen ürünün stok lokasyon detaylarını getirir
func (h *ProductHandler) GetProductInventory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "İşlem için ürün ID gerekli"})
		return
	}

	var parsedId uint
	_, err := fmt.Sscanf(id, "%d", &parsedId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ürün ID formatı gerekli (sayı olmalı)"})
		return
	}

	invs, err := h.service.GetProductInventory(parsedId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stok verileri alınamadı", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": invs})
}

// GetAllLocations - Yönetim paneli için kayıtlı lokasyonları listeler
func (h *ProductHandler) GetAllLocations(c *gin.Context) {
	locs, err := h.service.GetAllLocations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lokasyonlar alınamadı", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": locs})
}

// GetAllCampaigns - Tüm kampanyaları döndürür
func (h *ProductHandler) GetAllCampaigns(c *gin.Context) {
	campaigns, err := h.service.GetAllCampaigns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanyalar getirilirken hata oluştu", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": campaigns})
}

// CreateCampaign - Yeni kampanya ekler
func (h *ProductHandler) CreateCampaign(c *gin.Context) {
	var campaign models.Campaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	if err := h.service.CreateCampaign(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanya eklenemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Kampanya başarıyla oluşturuldu", "data": campaign})
}

// UpdateCampaign - Kampanya günceller
func (h *ProductHandler) UpdateCampaign(c *gin.Context) {
	var campaign models.Campaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	if err := h.service.UpdateCampaign(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanya güncellenemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kampanya başarıyla güncellendi", "data": campaign})
}

// DeleteCampaign - Kampanya siler
func (h *ProductHandler) DeleteCampaign(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID gerekli"})
		return
	}

	var parsedId uint
	_, err := fmt.Sscanf(id, "%d", &parsedId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ID gerekli"})
		return
	}

	if err := h.service.DeleteCampaign(parsedId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanya silinemedi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kampanya silindi"})
}

// GetProductCampaignsList - Ürünün sahip olduğu kampanyaları getirir
func (h *ProductHandler) GetProductCampaignsList(c *gin.Context) {
	id := c.Param("id")
	var parsedId uint
	if _, err := fmt.Sscanf(id, "%d", &parsedId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ürün ID"})
		return
	}
	campaigns, err := h.service.GetProductCampaignsList(parsedId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanyalar alınamadı", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": campaigns})
}

// AssignCampaignToProduct - Ürüne kampanya atar
func (h *ProductHandler) AssignCampaignToProduct(c *gin.Context) {
	id := c.Param("id")
	var parsedId uint
	if _, err := fmt.Sscanf(id, "%d", &parsedId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ürün ID"})
		return
	}

	var req struct {
		CampaignID uint `json:"campaign_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	pc := models.ProductCampaign{
		ProductID:  parsedId,
		CampaignID: req.CampaignID,
	}

	if err := h.service.AssignCampaignToProduct(&pc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanya atanamadı", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kampanya ürüne atandı"})
}

// RemoveCampaignFromProduct - Üründen kampanya kaldırır
func (h *ProductHandler) RemoveCampaignFromProduct(c *gin.Context) {
	productId := c.Param("id")
	campaignId := c.Param("campaignId")

	var parsedProductId, parsedCampaignId uint
	if _, err := fmt.Sscanf(productId, "%d", &parsedProductId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ürün ID"})
		return
	}
	if _, err := fmt.Sscanf(campaignId, "%d", &parsedCampaignId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kampanya ID"})
		return
	}

	if err := h.service.RemoveCampaignFromProduct(parsedProductId, parsedCampaignId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kampanya üründen kaldırılamadı", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kampanya üründen kaldırıldı"})
}

// BulkPriceUpdate - Excel'den toplu fiyat güncelleme yapar
func (h *ProductHandler) BulkPriceUpdate(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lütfen bir dosya seçin"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Dosya açılamadı"})
		return
	}
	defer src.Close()

	f, err := excelize.OpenReader(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Excel dosyası okunamadı"})
		return
	}
	defer f.Close()

	// Ilk sayfayı al
	sheetName := f.GetSheetName(0)
	rows, err := f.GetRows(sheetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Satırlar okunamadı"})
		return
	}

	updates := make(map[string]float64)
	// Başlık satırını atla: Cols: A (Barkod), B (Yeni Fiyat)
	for i, row := range rows {
		if i == 0 || len(row) < 2 {
			continue
		}
		barcode := row[0]
		priceStr := row[1]
		price, err := strconv.ParseFloat(priceStr, 64)
		if err == nil {
			updates[barcode] = price
		}
	}

	count, err := h.service.UpdatePricesBulk(updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Güncelleme sırasında hata oluştu", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("%d ürünün fiyatı başarıyla güncellendi.", count),
		"count":   count,
	})
}

// ImportFromExcel - Yeni şablona uygun Excel verisi aktarma
func (h *ProductHandler) ImportFromExcel(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lütfen bir dosya seçin", "success": false})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Dosya açılamadı", "success": false})
		return
	}
	defer src.Close()

	f, err := excelize.OpenReader(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Excel dosyası okunamadı", "success": false})
		return
	}
	defer f.Close()

	sheetName := f.GetSheetName(0)
	rows, err := f.GetRows(sheetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Satırlar okunamadı", "success": false})
		return
	}

	if len(rows) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dosya boş", "success": false})
		return
	}

	headerMap := make(map[string]int)
	for i, hName := range rows[0] {
		// Başlık boşluklardan arındırılıp küçük harfe de alınabilir, biz doğrudan tam eşitliği arayacağız veya uppercase yapacağız
		val := strings.TrimSpace(strings.ToUpper(hName))
		headerMap[val] = i
	}

	var parsedRows []models.ImportedProduct

	for i, row := range rows {
		if i == 0 {
			continue // Başlık satırını atla
		}

		getCol := func(name string) string {
			idx, ok := headerMap[name]
			if ok && idx < len(row) {
				return strings.TrimSpace(row[idx])
			}
			return ""
		}

		barcode := getCol("BARKOD")
		name := getCol("ADI")

		// Eğer Barkod veya Adı boşsa bu satırı atla (veya sadece tamamen boşları atla, DB loguna atsın)
		if barcode == "" && name == "" {
			continue
		}

		priceStr := getCol("FİYAT")
		magazaStr := getCol("MAGAZA")
		depoStr := getCol("DEPO")

		// Fiyattaki virgülü noktaya çevir ki float'a parse olsun
		priceStr = strings.ReplaceAll(priceStr, ",", ".")
		magazaStr = strings.ReplaceAll(magazaStr, ",", ".")
		depoStr = strings.ReplaceAll(depoStr, ",", ".")

		var price, magazaStock, depoStock float64
		if priceStr != "" {
			price, _ = strconv.ParseFloat(priceStr, 64)
		}
		if magazaStr != "" {
			magazaStock, _ = strconv.ParseFloat(magazaStr, 64)
		}
		if depoStr != "" {
			depoStock, _ = strconv.ParseFloat(depoStr, 64)
		}

		parsedRows = append(parsedRows, models.ImportedProduct{
			Barcode:     barcode,
			Name:        name,
			ProductCode: getCol("KODU"),
			Category:    getCol("ANAGRUP"),
			SubCategory: getCol("ALTGRUP"),
			Price:       price,
			Currency:    getCol("DVZ"),
			MagazaStock: magazaStock,
			DepoStock:   depoStock,
		})
	}

	result, err := h.service.ImportProductsBulk(parsedRows)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "İçe aktarım sırasında hata oluştu",
			"detail":  err.Error(),
			"success": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"created":       result.Created,
		"updated":       result.Updated,
		"errors":        result.Errors,
		"error_details": result.Details,
	})
}

// SearchProducts - Ürün ismi veya barkod ile arama (Personel ekranı için)
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arama terimi giriniz"})
		return
	}

	products, err := h.service.SearchProducts(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Arama sırasında hata oluştu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": products})
}

// GetProductPrices - Seçilen ürünün fiyat geçmişini getirir
func (h *ProductHandler) GetProductPrices(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "İşlem için ürün ID gerekli"})
		return
	}

	var parsedId uint
	_, err := fmt.Sscanf(id, "%d", &parsedId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir ürün ID formatı gerekli (sayı olmalı)"})
		return
	}

	prices, err := h.service.GetProductPrices(parsedId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fiyat verileri alınamadı", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": prices})
}

// BulkPriceByPercentage - Yüzdesel toplu fiyat güncelleme
// Body: { "percentage": 10.5, "category": "Atıştırmalık", "brand": "Ülker", "sub_category": "" }
// percentage pozitifse ZAM, negatifse İNDİRİM
func (h *ProductHandler) BulkPriceByPercentage(c *gin.Context) {
	var req struct {
		Percentage  float64 `json:"percentage"`
		Category    string  `json:"category"`
		SubCategory string  `json:"sub_category"`
		Brand       string  `json:"brand"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz istek verisi", "detail": err.Error()})
		return
	}

	if req.Percentage == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Yüzde değeri 0 olamaz"})
		return
	}

	count, err := h.service.BulkPriceByPercentage(req.Percentage, req.Category, req.SubCategory, req.Brand)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Toplu fiyat güncelleme başarısız", "detail": err.Error()})
		return
	}

	action := "zam"
	if req.Percentage < 0 {
		action = "indirim"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("%d ürüne %%%.1f %s uygulandı.", count, req.Percentage, action),
		"count":   count,
	})
}
