package models

import (
	"time"

	"gorm.io/gorm"
)

// Lookup - Genel amaçlı değer listesi (Marka, Birim Tipi, Para Birimi vb.)
// type: "brand" | "unit_type" | "currency" | "shelf" | "sub_category"
type Lookup struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Type      string         `gorm:"type:varchar(50);not null;index" json:"type"`
	Value     string         `gorm:"type:varchar(255);not null" json:"value"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Supplier - Tedarikçi bilgileri
type Supplier struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	ContactName string         `gorm:"type:varchar(255)" json:"contact_name"`
	Phone       string         `gorm:"type:varchar(50)" json:"phone"`
	Email       string         `gorm:"type:varchar(255)" json:"email"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Category - Kategori ve Alt Kategori Sistemi
type Category struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `gorm:"type:varchar(255);not null" json:"name"`
	ParentID      *uint          `json:"parent_id"` // Nullable: Boşsa ana kategoridir
	Parent        *Category      `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	SubCategories []Category     `gorm:"foreignKey:ParentID" json:"sub_categories,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// Campaign - İndirim/Kampanya kuralları
type Campaign struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `gorm:"type:varchar(255);not null" json:"name"`
	Description   string         `gorm:"type:text" json:"description"`
	DiscountType  string         `gorm:"type:varchar(50)" json:"discount_type"` // percentage, fixed_amount
	DiscountValue float64        `gorm:"type:decimal(10,2);not null" json:"discount_value"`
	StartDate     time.Time      `gorm:"not null" json:"start_date"`
	EndDate       time.Time      `gorm:"not null" json:"end_date"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// Product - Ürün temel bilgileri
type Product struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	Barcode            string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"barcode"`
	Name               string         `gorm:"type:varchar(255);not null" json:"name"`
	ProductCode        string         `gorm:"type:varchar(100)" json:"product_code"`
	Brand              string         `gorm:"type:varchar(100)" json:"brand"`
	Description        string         `gorm:"type:text" json:"description"`
	Category           string         `gorm:"type:varchar(100)" json:"category"`
	SubCategory        string         `gorm:"type:varchar(100)" json:"sub_category"`
	CategoryID         *uint          `json:"category_id"`
	CategoryRel        *Category      `gorm:"foreignKey:CategoryID" json:"category_rel,omitempty"`
	UnitType           string         `gorm:"type:varchar(20)" json:"unit_type"`
	ShelfCode          string         `gorm:"type:varchar(50)" json:"shelf_code"`
	SupplierID         *uint          `json:"supplier_id"`
	Supplier           Supplier       `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	CriticalStockLevel float64        `gorm:"type:decimal(10,2);default:10" json:"critical_stock_level"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	ActivePrice        float64        `gorm:"-" json:"active_price"`
}

// ProductCampaign - Ürün ve Kampanya ilişki tablosu (Many-to-Many için)
type ProductCampaign struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ProductID  uint      `json:"product_id"`
	Product    Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	CampaignID uint      `json:"campaign_id"`
	Campaign   Campaign  `gorm:"foreignKey:CampaignID" json:"campaign,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// ProductPrice - Ürün Fiyat Geçmişi
type ProductPrice struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ProductID     uint           `json:"product_id"`
	Product       Product        `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Price         float64        `gorm:"type:decimal(10,2);not null" json:"price"`
	Currency      string         `gorm:"type:varchar(10);default:'TRY'" json:"currency"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	EffectiveDate time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"effective_date"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// Location - Depo ve Raf tanımları
type Location struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name"`
	Type      string         `gorm:"type:varchar(50)" json:"type"` // warehouse, shelf
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Inventory - Stok bilgileri
type Inventory struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ProductID   uint           `json:"product_id"`
	Product     Product        `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	LocationID  uint           `json:"location_id"`
	Location    Location       `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	Quantity    float64        `gorm:"type:decimal(10,2);default:0" json:"quantity"`
	LastUpdated time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"last_updated"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Staff - Market personeli ve Yönetici kayıtları
type Staff struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"username"`
	Password  string         `gorm:"type:varchar(255);not null" json:"password"`
	FullName  string         `gorm:"type:varchar(255)" json:"full_name"`
	Role      string         `gorm:"type:varchar(50);default:'staff'" json:"role"` // admin, staff
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// ProductRequest - Personel tarafından gönderilen eksik ürün bildirimleri
type ProductRequest struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Barcode       string         `gorm:"type:varchar(50);not null" json:"barcode"`
	StockQuantity float64        `gorm:"type:decimal(10,2);not null" json:"stock_quantity"`
	ImageURL      string         `gorm:"type:varchar(255)" json:"image_url"`
	Status        string         `gorm:"type:varchar(50);default:'pending'" json:"status"` // pending, approved, rejected
	Notes         string         `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// ImportedProduct - Excel'den çekilen ham ürün DTO'su
type ImportedProduct struct {
	Name        string
	ProductCode string
	Category    string
	SubCategory string
	Barcode     string
	Price       float64
	Currency    string
	MagazaStock float64
	DepoStock   float64
}

// ImportResult - Toplu içe aktarma işlem özeti
type ImportResult struct {
	Created int      `json:"created"`
	Updated int      `json:"updated"`
	Errors  int      `json:"errors"`
	Details []string `json:"error_details"`
}
