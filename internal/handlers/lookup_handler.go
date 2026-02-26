package handlers

import (
	"easydata/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LookupHandler - Marka, Birim Tipi, Para Birimi gibi lookup değerlerini yönetir
type LookupHandler struct {
	db *gorm.DB
}

func NewLookupHandler(db *gorm.DB) *LookupHandler {
	return &LookupHandler{db: db}
}

// GetByType - Belirli tipteki tüm lookup değerlerini getirir
// GET /api/v1/admin/lookups?type=brand
func (h *LookupHandler) GetByType(c *gin.Context) {
	lookupType := c.Query("type")
	if lookupType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type parametresi zorunludur"})
		return
	}

	var items []models.Lookup
	if err := h.db.Where("type = ?", lookupType).Order("value asc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Veriler getirilemedi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

// GetAll - Tüm lookup değerlerini type'a göre gruplanmış getirir
// GET /api/v1/admin/lookups/all
func (h *LookupHandler) GetAll(c *gin.Context) {
	var items []models.Lookup
	if err := h.db.Order("type asc, value asc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Veriler getirilemedi"})
		return
	}

	// Tip'e göre grupla
	grouped := make(map[string][]models.Lookup)
	for _, item := range items {
		grouped[item.Type] = append(grouped[item.Type], item)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": grouped})
}

// Create - Yeni lookup değeri ekler
// POST /api/v1/admin/lookups
func (h *LookupHandler) Create(c *gin.Context) {
	var item models.Lookup
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri"})
		return
	}

	if item.Type == "" || item.Value == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type ve value zorunludur"})
		return
	}

	// Duplicate kontrolü
	var existing models.Lookup
	if err := h.db.Where("type = ? AND value = ?", item.Type, item.Value).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Bu değer zaten mevcut"})
		return
	}

	if err := h.db.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kayıt oluşturulamadı"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": item})
}

// Delete - Lookup değerini siler
// DELETE /api/v1/admin/lookups/:id
func (h *LookupHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ID"})
		return
	}

	if err := h.db.Delete(&models.Lookup{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Silme başarısız"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Silindi"})
}
