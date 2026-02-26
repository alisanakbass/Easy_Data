package repository

import (
	"easydata/internal/models"

	"gorm.io/gorm"
)

// ProductRepository - Ürünlerle ilgili tüm veritabanı işlemleri
type ProductRepository interface {
	FindByBarcode(barcode string) (*models.Product, error)
	GetActivePrice(productID uint) (*models.ProductPrice, error)
	GetInventory(productID uint) ([]models.Inventory, error)
	GetActiveCampaigns(productID uint) ([]models.Campaign, error)

	// Admin CRUD metodları - Ürün
	GetAllProducts() ([]models.Product, error)
	CreateProduct(product *models.Product) error
	UpdateProduct(product *models.Product) error
	DeleteProduct(id uint) error

	// Admin CRUD metodları - Fiyat
	AddProductPrice(price *models.ProductPrice) error

	// Dashboard için istatistikler
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
}

type productRepository struct {
	db *gorm.DB
}

// NewProductRepository - Repository başlatıcı
func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

// FindByBarcode - Barkoda göre ürün getirir
func (r *productRepository) FindByBarcode(barcode string) (*models.Product, error) {
	var product models.Product
	err := r.db.Preload("Supplier").Where("barcode = ?", barcode).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// GetActivePrice - Ürünün güncel aktif fiyatını getirir
func (r *productRepository) GetActivePrice(productID uint) (*models.ProductPrice, error) {
	var price models.ProductPrice
	err := r.db.Where("product_id = ? AND is_active = ?", productID, true).Order("effective_date desc").First(&price).Error
	if err != nil {
		return nil, err
	}
	return &price, nil
}

// GetInventory - Ürünün stok lokasyonlarını getirir
func (r *productRepository) GetInventory(productID uint) ([]models.Inventory, error) {
	var inventories []models.Inventory
	err := r.db.Preload("Location").Where("product_id = ?", productID).Find(&inventories).Error
	if err != nil {
		return nil, err
	}
	return inventories, nil
}

// GetActiveCampaigns - Ürünün aktif kampanyalarını getirir
func (r *productRepository) GetActiveCampaigns(productID uint) ([]models.Campaign, error) {
	var campaigns []models.Campaign
	// Join ile product_campaigns tablosu üzerinden aktif kampanyaları buluyoruz
	err := r.db.Table("campaigns").
		Select("campaigns.*").
		Joins("JOIN product_campaigns ON product_campaigns.campaign_id = campaigns.id").
		Where("product_campaigns.product_id = ? AND campaigns.is_active = ? AND campaigns.start_date <= CURRENT_TIMESTAMP AND campaigns.end_date >= CURRENT_TIMESTAMP", productID, true).
		Find(&campaigns).Error

	if err != nil {
		return nil, err
	}
	return campaigns, nil
}

// GetAllProducts - Tüm ürünleri getirir (Admin Listesi)
func (r *productRepository) GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	err := r.db.Preload("Supplier").Find(&products).Error
	if err != nil {
		return nil, err
	}
	return products, nil
}

// CreateProduct - Yeni bir ürün oluşturur (Fiyat ile birlikte düşünülebilir ama şimdilik sadece ürün)
func (r *productRepository) CreateProduct(product *models.Product) error {
	return r.db.Create(product).Error
}

// UpdateProduct - Ürünü günceller
func (r *productRepository) UpdateProduct(product *models.Product) error {
	return r.db.Save(product).Error
}

// DeleteProduct - Ürünü siler (Soft Delete - DeletedAt alanı doldurulur)
func (r *productRepository) DeleteProduct(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

// AddProductPrice - Ürüne yeni bir fiyat ekler, eskisini pasif yapar
func (r *productRepository) AddProductPrice(price *models.ProductPrice) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Var olan aktif fiyatları pasife çek
		if err := tx.Model(&models.ProductPrice{}).
			Where("product_id = ? AND is_active = ?", price.ProductID, true).
			Update("is_active", false).Error; err != nil {
			return err
		}

		// Yeni fiyatı kaydet
		price.IsActive = true
		if err := tx.Create(price).Error; err != nil {
			return err
		}

		return nil
	})
}

// GetDashboardStats - Admin paneli için özet istatistikler ve son eklenen ürünleri döndürür
func (r *productRepository) GetDashboardStats() (map[string]interface{}, error) {
	var totalProducts int64
	var activeCampaigns int64
	var lowStockProducts int64
	var recentProducts []models.Product

	// 1. Toplam Ürün Sayısı
	r.db.Model(&models.Product{}).Count(&totalProducts)

	// 2. Aktif Kampanya Sayısı
	r.db.Model(&models.Campaign{}).Where("is_active = ?", true).Count(&activeCampaigns)

	// 3. Stoku Kritik Seviyenin Altında Olan Ürün Sayısı
	// (Basitleştirmek adına burada ürünlerin inventory toplamını DB bazında hesaplıyoruz)
	// Şimdilik test amaçlı sabit bir sayı veya basit bir count ile devam edebiliriz.
	// Daha performanslı olması için left join ile group by kullanılabilir:
	r.db.Raw(`
		SELECT COUNT(*) FROM (
			SELECT p.id, COALESCE(SUM(i.quantity), 0) as total_qty, p.critical_stock_level
			FROM products p
			LEFT JOIN inventories i ON i.product_id = p.id
			GROUP BY p.id, p.critical_stock_level
			HAVING COALESCE(SUM(i.quantity), 0) <= p.critical_stock_level
		) AS low_stock
	`).Scan(&lowStockProducts)

	// 4. Son Eklenen 5 Ürün
	r.db.Order("created_at desc").Limit(5).Find(&recentProducts)

	return map[string]interface{}{
		"total_products":     totalProducts,
		"active_campaigns":   activeCampaigns,
		"low_stock_products": lowStockProducts,
		"recent_products":    recentProducts,
	}, nil
}

// AddOrUpdateInventory - Stok lokasyonuna (rafta veya depoda) ürün ekler veya günceller
func (r *productRepository) AddOrUpdateInventory(inventory *models.Inventory) error {
	// Önce aynı lokasyonda bu ürün var mı diye bak
	var existingInventory models.Inventory
	err := r.db.Where("product_id = ? AND location_id = ?", inventory.ProductID, inventory.LocationID).First(&existingInventory).Error

	if err == nil {
		// Varsa sadece miktarını güncelle
		existingInventory.Quantity = inventory.Quantity
		return r.db.Save(&existingInventory).Error
	}

	// Yoksa sıfırdan ekle
	return r.db.Create(inventory).Error
}

// GetProductInventory - Belirli bir ürüne ait tüm lokasyonlardaki stokları getirir
func (r *productRepository) GetProductInventory(productID uint) ([]models.Inventory, error) {
	var inventories []models.Inventory
	err := r.db.Preload("Location").Where("product_id = ?", productID).Find(&inventories).Error
	if err != nil {
		return nil, err
	}
	return inventories, nil
}

// GetAllLocations - Yönetim paneli stok ataması için seçilebilecek tüm depoları / rafları getirir
func (r *productRepository) GetAllLocations() ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Find(&locations).Error
	if err != nil {
		return nil, err
	}
	return locations, nil
}

// GetAllCampaigns - Tüm kampanyaları döndürür
func (r *productRepository) GetAllCampaigns() ([]models.Campaign, error) {
	var campaigns []models.Campaign
	err := r.db.Find(&campaigns).Error
	return campaigns, err
}

// CreateCampaign - Yeni kampanya oluşturur
func (r *productRepository) CreateCampaign(campaign *models.Campaign) error {
	return r.db.Create(campaign).Error
}

// UpdateCampaign - Mevcut kampanyayı günceller
func (r *productRepository) UpdateCampaign(campaign *models.Campaign) error {
	return r.db.Save(campaign).Error
}

// DeleteCampaign - Kampanyayı siler
func (r *productRepository) DeleteCampaign(id uint) error {
	return r.db.Delete(&models.Campaign{}, id).Error
}

// AssignCampaignToProduct - Ürüne kampanya atar
func (r *productRepository) AssignCampaignToProduct(pc *models.ProductCampaign) error {
	// Aynı kampanya zaten varsa tekrar ekleme
	var existing models.ProductCampaign
	err := r.db.Where("product_id = ? AND campaign_id = ?", pc.ProductID, pc.CampaignID).First(&existing).Error
	if err == nil {
		return nil // Zaten ekli
	}
	return r.db.Create(pc).Error
}

// RemoveCampaignFromProduct - Üründen kampanyayı çıkarır
func (r *productRepository) RemoveCampaignFromProduct(productID, campaignID uint) error {
	return r.db.Where("product_id = ? AND campaign_id = ?", productID, campaignID).Delete(&models.ProductCampaign{}).Error
}

// GetProductCampaignsList - Ürüne atanan kampanyaları getirir
func (r *productRepository) GetProductCampaignsList(productID uint) ([]models.Campaign, error) {
	var campaigns []models.Campaign
	err := r.db.Table("campaigns").
		Select("campaigns.*").
		Joins("JOIN product_campaigns ON product_campaigns.campaign_id = campaigns.id").
		Where("product_campaigns.product_id = ?", productID).
		Find(&campaigns).Error
	return campaigns, err
}

// UpdatePricesBulk - Birden fazla ürünün fiyatını barkod üzerinden toplu günceller
func (r *productRepository) UpdatePricesBulk(updates map[string]float64) (int, error) {
	updatedCount := 0
	err := r.db.Transaction(func(tx *gorm.DB) error {
		for barcode, newPrice := range updates {
			var product models.Product
			if err := tx.Where("barcode = ?", barcode).First(&product).Error; err != nil {
				continue // Ürün bulunamazsa atla
			}

			// Eski aktif fiyatları pasife çek
			if err := tx.Model(&models.ProductPrice{}).
				Where("product_id = ? AND is_active = ?", product.ID, true).
				Update("is_active", false).Error; err != nil {
				return err
			}

			// Yeni fiyat ekle
			priceEntry := models.ProductPrice{
				ProductID: product.ID,
				Price:     newPrice,
				IsActive:  true,
			}
			if err := tx.Create(&priceEntry).Error; err != nil {
				return err
			}
			updatedCount++
		}
		return nil
	})
	return updatedCount, err
}

// SearchProducts - Ürün ismi veya barkod ile arama yapar
func (r *productRepository) SearchProducts(query string) ([]models.Product, error) {
	var products []models.Product
	queryString := "%" + query + "%"
	err := r.db.Preload("Supplier").
		Where("name LIKE ? OR barcode LIKE ?", queryString, queryString).
		Limit(20). // Çok fazla sonuç dönmemesi için limit
		Find(&products).Error
	return products, err
}

// GetProductPrices - Bir ürünün tüm fiyat geçmişini (aktif/pasif) getirir
func (r *productRepository) GetProductPrices(productID uint) ([]models.ProductPrice, error) {
	var prices []models.ProductPrice
	err := r.db.Where("product_id = ?", productID).Order("effective_date desc").Find(&prices).Error
	return prices, err
}

// BulkPriceByPercentage - Filtreye göre seçilen ürünlerin fiyatlarını yüzdesel günceller
func (r *productRepository) BulkPriceByPercentage(percentage float64, category, subCategory, brand string) (int, error) {
	var products []models.Product

	query := r.db.Model(&models.Product{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if subCategory != "" {
		query = query.Where("sub_category = ?", subCategory)
	}
	if brand != "" {
		query = query.Where("brand = ?", brand)
	}

	if err := query.Find(&products).Error; err != nil {
		return 0, err
	}

	updatedCount := 0
	err := r.db.Transaction(func(tx *gorm.DB) error {
		for _, product := range products {
			// Aktif fiyatı bul
			var currentPrice models.ProductPrice
			if err := tx.Where("product_id = ? AND is_active = true", product.ID).
				First(&currentPrice).Error; err != nil {
				continue // Aktif fiyat yoksa atla
			}

			// Yeni fiyatı hesapla
			newPrice := currentPrice.Price * (1 + percentage/100)
			if newPrice < 0 {
				newPrice = 0
			}

			// Eski fiyatı pasif yap
			if err := tx.Model(&models.ProductPrice{}).Where("product_id = ?", product.ID).
				Update("is_active", false).Error; err != nil {
				return err
			}

			// Yeni fiyat kaydı ekle
			newPriceEntry := models.ProductPrice{
				ProductID: product.ID,
				Price:     newPrice,
				IsActive:  true,
			}
			if err := tx.Create(&newPriceEntry).Error; err != nil {
				return err
			}
			updatedCount++
		}
		return nil
	})
	return updatedCount, err
}

func (r *productRepository) getOrCreateLocation(name, locType string) uint {
	var loc models.Location
	if err := r.db.Where("name = ?", name).First(&loc).Error; err != nil {
		loc = models.Location{Name: name, Type: locType}
		r.db.Create(&loc)
	}
	return loc.ID
}

// ImportProductsBulk - Excel'deki listeyi toplu işleyip DB'ye kaydeder
func (r *productRepository) ImportProductsBulk(products []models.ImportedProduct) (models.ImportResult, error) {
	var result models.ImportResult

	locMagaza := r.getOrCreateLocation("Mağaza", "warehouse")
	locDepo := r.getOrCreateLocation("Depo", "warehouse")

	err := r.db.Transaction(func(tx *gorm.DB) error {
		for _, v := range products {
			if v.Barcode == "" || v.Name == "" {
				result.Errors++
				result.Details = append(result.Details, "Barkod veya İsim eksik. (Satır atlandı)")
				continue
			}

			// Kategori bul veya oluştur
			var category models.Category
			if v.Category != "" {
				tx.Where("name = ?", v.Category).FirstOrCreate(&category, models.Category{Name: v.Category})
			}

			// SubCategory bul veya oluştur
			var subCategory models.Category
			if v.SubCategory != "" && category.ID != 0 {
				catID := category.ID
				tx.Where("name = ? AND parent_id = ?", v.SubCategory, catID).FirstOrCreate(&subCategory, models.Category{Name: v.SubCategory, ParentID: &catID})
			}

			// Ürünü bul veya yarat
			var product models.Product
			if err := tx.Where("barcode = ?", v.Barcode).First(&product).Error; err != nil {
				// Yok (Yeni)
				product = models.Product{
					Barcode:     v.Barcode,
					Name:        v.Name,
					ProductCode: v.ProductCode,
					Category:    v.Category,
					SubCategory: v.SubCategory,
				}
				if category.ID != 0 {
					product.CategoryID = &category.ID
				}
				if err := tx.Create(&product).Error; err != nil {
					result.Errors++
					result.Details = append(result.Details, "Ürün oluşturulamadı: "+v.Barcode)
					continue
				}
				result.Created++
			} else {
				// Var (Güncelle)
				product.Name = v.Name
				product.ProductCode = v.ProductCode
				product.Category = v.Category
				product.SubCategory = v.SubCategory
				if category.ID != 0 {
					product.CategoryID = &category.ID
				}
				if err := tx.Save(&product).Error; err != nil {
					result.Errors++
					result.Details = append(result.Details, "Ürün güncellenemedi: "+v.Barcode)
					continue
				}
				result.Updated++
			}

			// Fiyat İşlemi
			if v.Price > 0 {
				currency := v.Currency
				if currency == "Türk Lirası" || currency == "" {
					currency = "TRY"
				}

				tx.Model(&models.ProductPrice{}).Where("product_id = ? AND is_active = ?", product.ID, true).Update("is_active", false)
				priceEntry := models.ProductPrice{
					ProductID: product.ID,
					Price:     v.Price,
					Currency:  currency,
					IsActive:  true,
				}
				tx.Create(&priceEntry)
			}

			// Mağaza Stok İşlemi
			if locMagaza != 0 {
				var magazaInv models.Inventory
				if err := tx.Where("product_id = ? AND location_id = ?", product.ID, locMagaza).First(&magazaInv).Error; err == nil {
					magazaInv.Quantity = v.MagazaStock
					tx.Save(&magazaInv)
				} else {
					tx.Create(&models.Inventory{ProductID: product.ID, LocationID: locMagaza, Quantity: v.MagazaStock})
				}
			}

			// Depo Stok İşlemi
			if locDepo != 0 {
				var depoInv models.Inventory
				if err := tx.Where("product_id = ? AND location_id = ?", product.ID, locDepo).First(&depoInv).Error; err == nil {
					depoInv.Quantity = v.DepoStock
					tx.Save(&depoInv)
				} else {
					tx.Create(&models.Inventory{ProductID: product.ID, LocationID: locDepo, Quantity: v.DepoStock})
				}
			}
		}
		return nil
	})

	return result, err
}
