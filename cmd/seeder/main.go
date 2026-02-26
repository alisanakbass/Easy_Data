package main

import (
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	"easydata/internal/models"
	"easydata/pkg/database"
)

func init() {
	godotenv.Load()
}

func main() {
	// Veritabanı bağlantısı
	database.ConnectDB()

	// Mevcutları temizle (isteğe bağlı, duplicate hatası vermemesi için)
	// database.DB.Exec("DELETE FROM product_campaigns")
	// database.DB.Exec("DELETE FROM campaigns")
	// database.DB.Exec("DELETE FROM inventories")
	// database.DB.Exec("DELETE FROM product_prices")
	// database.DB.Exec("DELETE FROM products")
	// database.DB.Exec("DELETE FROM locations")
	// database.DB.Exec("DELETE FROM suppliers")

	// 0. İlk Yönetici Hesabını Oluştur (Eğer yoksa)
	var adminCount int64
	database.DB.Model(&models.Staff{}).Where("role = ?", "admin").Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := models.Staff{
			Username: "admin",
			Password: string(hashedPassword),
			FullName: "Sistem Yöneticisi",
			Role:     "admin",
			IsActive: true,
		}
		database.DB.Create(&admin)
		log.Println("İlk yönetici hesabı oluşturuldu: admin / admin123")
	}

	// 1. Tedarikçi
	supplier := models.Supplier{
		Name:        "Test Toptancı A.Ş.",
		ContactName: "Ahmet Yılmaz",
		Phone:       "05554443322",
	}
	database.DB.FirstOrCreate(&supplier, models.Supplier{Name: "Test Toptancı A.Ş."})

	// 2. Lokasyon (Raf ve Depo)
	shelf := models.Location{Name: "Reyon 1 - İçecekler", Type: "shelf"}
	warehouse := models.Location{Name: "Arka Depo Ana", Type: "warehouse"}
	database.DB.FirstOrCreate(&shelf, models.Location{Name: "Reyon 1 - İçecekler"})
	database.DB.FirstOrCreate(&warehouse, models.Location{Name: "Arka Depo Ana"})

	// 3. Kampanya (%20 İndirim)
	campaign := models.Campaign{
		Name:          "Hafta Sonu Fırsatı %20",
		Description:   "Tüm seçili ürünlerde %20 indirim uygulanır.",
		DiscountType:  "percentage",
		DiscountValue: 20,
		StartDate:     database.DB.NowFunc().AddDate(0, 0, -1), // Dün başladı
		EndDate:       database.DB.NowFunc().AddDate(0, 0, 5),  // 5 gün sonra bitiyor
		IsActive:      true,
	}
	database.DB.FirstOrCreate(&campaign, models.Campaign{Name: "Hafta Sonu Fırsatı %20"})

	// 4. Ürün 1 - Coca Cola (Gerçekçi barkod: 8690624200424)
	product1 := models.Product{
		Barcode:            "8690624200424",
		Name:               "Coca-Cola Şekersiz 330ml Kutu",
		Description:        "Buz gibi serinlik.",
		Category:           "İçecek",
		UnitType:           "Adet",
		SupplierID:         &supplier.ID,
		CriticalStockLevel: 50,
	}
	// Barkoda göre kontrol edip varsa ekleme yapmayız
	var p1Count int64
	database.DB.Model(&models.Product{}).Where("barcode = ?", product1.Barcode).Count(&p1Count)
	if p1Count == 0 {
		database.DB.Create(&product1)

		// Fiyatı (30 TL)
		database.DB.Create(&models.ProductPrice{ProductID: product1.ID, Price: 30.00, IsActive: true})

		// Stoğu (Rafta 20, Depoda 100) -> Toplam 120
		database.DB.Create(&models.Inventory{ProductID: product1.ID, LocationID: shelf.ID, Quantity: 20})
		database.DB.Create(&models.Inventory{ProductID: product1.ID, LocationID: warehouse.ID, Quantity: 100})

		// Bu ürüne kampanya uygulayacağız
		database.DB.Create(&models.ProductCampaign{ProductID: product1.ID, CampaignID: campaign.ID})
	}

	// 5. Ürün 2 - Süt (Basit test barkodu: 123456789)
	product2 := models.Product{
		Barcode:            "123456789",
		Name:               "Tam Yağlı Süt 1 Litre",
		Description:        "Taze inek sütü.",
		Category:           "Süt Ürünleri",
		UnitType:           "Litre",
		SupplierID:         &supplier.ID,
		CriticalStockLevel: 20,
	}
	var p2Count int64
	database.DB.Model(&models.Product{}).Where("barcode = ?", product2.Barcode).Count(&p2Count)
	if p2Count == 0 {
		database.DB.Create(&product2)

		// Fiyatı (45 TL)
		database.DB.Create(&models.ProductPrice{ProductID: product2.ID, Price: 45.00, IsActive: true})

		// Stoğu (Kritik Stok Uyarısı verdirmek için toplam 5 tane koyalım)
		database.DB.Create(&models.Inventory{ProductID: product2.ID, LocationID: shelf.ID, Quantity: 5})

		// Kampanya YOK
	}

	log.Println("Örnek test verileri (Seeder) başarıyla veritabanına eklendi!")
}
