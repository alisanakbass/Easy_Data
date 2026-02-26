package services

import (
	"easydata/internal/models"
	"easydata/internal/repository"
	"math"
)

// ProductResponse - Müşteri uygulamasına gönderilecek özel JSON yapısı
type ProductResponse struct {
	Product       *models.Product    `json:"product"`
	OriginalPrice float64            `json:"original_price"`
	CurrentPrice  float64            `json:"current_price"`
	DiscountName  string             `json:"discount_name,omitempty"`
	Inventories   []models.Inventory `json:"inventories"`
	CriticalStock bool               `json:"is_critical_stock"`
	TotalStock    float64            `json:"total_stock"`
}

type ProductService interface {
	GetProductDetails(barcode string) (*ProductResponse, error)
	GetAllProducts() ([]models.Product, error)
	CreateProduct(product *models.Product) error
	UpdateProduct(product *models.Product) error
	DeleteProduct(id uint) error

	AddProductPrice(price *models.ProductPrice) error

	GetDashboardStats() (map[string]interface{}, error)

	// Admin CRUD metodları - Stok
	AddOrUpdateInventory(inventory *models.Inventory) error
	GetProductInventory(productID uint) ([]models.Inventory, error)
	GetAllLocations() ([]models.Location, error)

	// Admin CRUD metodları - Kampanyalar
	GetAllCampaigns() ([]models.Campaign, error)
	CreateCampaign(campaign *models.Campaign) error
	UpdateCampaign(campaign *models.Campaign) error
	DeleteCampaign(id uint) error

	// Kampanya Atama
	AssignCampaignToProduct(pc *models.ProductCampaign) error
	RemoveCampaignFromProduct(productID, campaignID uint) error
	GetProductCampaignsList(productID uint) ([]models.Campaign, error)

	// Toplu İşlemler
	UpdatePricesBulk(updates map[string]float64) (int, error)
	BulkPriceByPercentage(percentage float64, category, subCategory, brand string) (int, error)
	ImportProductsBulk(products []models.ImportedProduct) (models.ImportResult, error)

	// Arama
	SearchProducts(query string) ([]models.Product, error)

	// Fiyat Geçmişi
	GetProductPrices(productID uint) ([]models.ProductPrice, error)
} // <-- End of ProductService interface

type productService struct {
	repo repository.ProductRepository
}

// NewProductService - Servis başlatıcı
func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{repo: repo}
}

// GetProductDetails - Barkoda göre ürünün tüm hesaplanmış verilerini getirir
func (s *productService) GetProductDetails(barcode string) (*ProductResponse, error) {
	// 1. Ürünü bul
	product, err := s.repo.FindByBarcode(barcode)
	if err != nil {
		return nil, err // Ürün bulunamadı
	}

	// 2. Güncel aktif fiyatını bul
	price, err := s.repo.GetActivePrice(product.ID)
	originalPrice := 0.0
	if err == nil && price != nil {
		originalPrice = price.Price
	}

	// 3. Stok Durumunu Çek
	inventories, _ := s.repo.GetInventory(product.ID)

	// Toplam stok hesapla
	var totalStock float64 = 0
	for _, inv := range inventories {
		totalStock += inv.Quantity
	}

	// Stok kritik seviyenin altında mı?
	isCritical := totalStock <= product.CriticalStockLevel

	// 4. Aktif Kampanyaları (İndirimleri) Getir ve Uygula
	campaigns, _ := s.repo.GetActiveCampaigns(product.ID)

	currentPrice := originalPrice
	discountName := ""

	// Eğer ürünün kampanyası varsa, fiyata uygula (Şimdilik ilk kampanyayı uyguluyoruz)
	if len(campaigns) > 0 {
		activeCampaign := campaigns[0]
		discountName = activeCampaign.Name

		if activeCampaign.DiscountType == "percentage" {
			// % İndirim
			discountAmount := originalPrice * (activeCampaign.DiscountValue / 100)
			currentPrice = originalPrice - discountAmount
		} else if activeCampaign.DiscountType == "fixed_amount" {
			// Tutar İndirimi
			currentPrice = originalPrice - activeCampaign.DiscountValue
		}

		// Eğer indirim nedeniyle fiyat sıfırın altına düşerse sıfıra sabitle (Banka mantığı)
		if currentPrice < 0 {
			currentPrice = 0
		}
	}

	// Double değerlerindeki küsuratı yuvarlayalım (örnek: 99.90000000 -> 99.90)
	currentPrice = math.Round(currentPrice*100) / 100

	// Sonucu API uyumlu formata dönüştür
	response := &ProductResponse{
		Product:       product,
		OriginalPrice: originalPrice,
		CurrentPrice:  currentPrice,
		DiscountName:  discountName,
		Inventories:   inventories,
		TotalStock:    totalStock,
		CriticalStock: isCritical,
	}

	return response, nil
}

// GetAllProducts - Admin için tüm ürünleri getirir
func (s *productService) GetAllProducts() ([]models.Product, error) {
	products, err := s.repo.GetAllProducts()
	if err != nil {
		return nil, err
	}

	// Her ürün için aktif fiyatı bulalım
	for i := range products {
		price, err := s.repo.GetActivePrice(products[i].ID)
		if err == nil && price != nil {
			products[i].ActivePrice = price.Price
		}
	}

	return products, nil
}

// CreateProduct - Yeni ürün ekler
func (s *productService) CreateProduct(product *models.Product) error {
	return s.repo.CreateProduct(product)
}

// UpdateProduct - Var olan ürünü günceller
func (s *productService) UpdateProduct(product *models.Product) error {
	return s.repo.UpdateProduct(product)
}

// DeleteProduct - Ürünü id'ye göre siler
func (s *productService) DeleteProduct(id uint) error {
	return s.repo.DeleteProduct(id)
}

// AddProductPrice - Ürüne yeni fiyat ekler
func (s *productService) AddProductPrice(price *models.ProductPrice) error {
	return s.repo.AddProductPrice(price)
}

// GetDashboardStats - Admin Dashboard için istatistikleri getirir
func (s *productService) GetDashboardStats() (map[string]interface{}, error) {
	return s.repo.GetDashboardStats()
}

// AddOrUpdateInventory - Stok ekler / günceller
func (s *productService) AddOrUpdateInventory(inventory *models.Inventory) error {
	return s.repo.AddOrUpdateInventory(inventory)
}

// GetProductInventory - Ürüne ait stokları getirir
func (s *productService) GetProductInventory(productID uint) ([]models.Inventory, error) {
	return s.repo.GetProductInventory(productID)
}

// GetAllLocations - Kayıtlı tüm depoları/rafları getirir
func (s *productService) GetAllLocations() ([]models.Location, error) {
	return s.repo.GetAllLocations()
}

// GetAllCampaigns - Tüm kampanyaları döndürür
func (s *productService) GetAllCampaigns() ([]models.Campaign, error) {
	return s.repo.GetAllCampaigns()
}

// CreateCampaign - Yeni kampanya ekler
func (s *productService) CreateCampaign(campaign *models.Campaign) error {
	return s.repo.CreateCampaign(campaign)
}

// UpdateCampaign - Mevcut kampanyayı günceller
func (s *productService) UpdateCampaign(campaign *models.Campaign) error {
	return s.repo.UpdateCampaign(campaign)
}

// DeleteCampaign - Kampanyayı siler
func (s *productService) DeleteCampaign(id uint) error {
	return s.repo.DeleteCampaign(id)
}

// AssignCampaignToProduct - Ürüne kampanya atar
func (s *productService) AssignCampaignToProduct(pc *models.ProductCampaign) error {
	return s.repo.AssignCampaignToProduct(pc)
}

// RemoveCampaignFromProduct - Üründen kampanya kaldırır
func (s *productService) RemoveCampaignFromProduct(productID, campaignID uint) error {
	return s.repo.RemoveCampaignFromProduct(productID, campaignID)
}

// GetProductCampaignsList - Ürünün sahip olduğu kampanyaları getirir
func (s *productService) GetProductCampaignsList(productID uint) ([]models.Campaign, error) {
	return s.repo.GetProductCampaignsList(productID)
}

// UpdatePricesBulk - Toplu fiyat güncelleme servisi
func (s *productService) UpdatePricesBulk(updates map[string]float64) (int, error) {
	return s.repo.UpdatePricesBulk(updates)
}

func (s *productService) SearchProducts(query string) ([]models.Product, error) {
	products, err := s.repo.SearchProducts(query)
	if err != nil {
		return nil, err
	}

	// Her ürün için aktif fiyatı bulalım
	for i := range products {
		price, err := s.repo.GetActivePrice(products[i].ID)
		if err == nil && price != nil {
			products[i].ActivePrice = price.Price
		}
	}

	return products, nil
}

func (s *productService) GetProductPrices(productID uint) ([]models.ProductPrice, error) {
	return s.repo.GetProductPrices(productID)
}

// BulkPriceByPercentage - Filtrelere göre yüzdesel fiyat güncelleme
func (s *productService) BulkPriceByPercentage(percentage float64, category, subCategory, brand string) (int, error) {
	return s.repo.BulkPriceByPercentage(percentage, category, subCategory, brand)
}

// ImportProductsBulk - Excel import
func (s *productService) ImportProductsBulk(products []models.ImportedProduct) (models.ImportResult, error) {
	return s.repo.ImportProductsBulk(products)
}
