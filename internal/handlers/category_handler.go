package handlers

import (
	"fmt"
	"net/http"

	"easydata/internal/models"
	"easydata/internal/services"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	service services.CategoryService
}

func NewCategoryHandler(service services.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

// GetAllCategories - Tüm kategorileri ebeveyn-çocuk ilişkisiyle döndürür
func (h *CategoryHandler) GetAllCategories(c *gin.Context) {
	categories, err := h.service.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategoriler getirilemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": categories})
}

// CreateCategory - Yeni kategori ekler
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req models.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	if err := h.service.CreateCategory(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori oluşturulamadı", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
}

// UpdateCategory - Kategori düzenler
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var parsedId uint
	if _, err := fmt.Sscanf(id, "%d", &parsedId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ID"})
		return
	}

	var req models.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri"})
		return
	}
	req.ID = parsedId

	if err := h.service.UpdateCategory(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori güncellenemedi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori güncellendi"})
}

// DeleteCategory - Kategori siler
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	var parsedId uint
	if _, err := fmt.Sscanf(id, "%d", &parsedId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ID"})
		return
	}

	if err := h.service.DeleteCategory(parsedId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori silinemedi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori silindi"})
}
