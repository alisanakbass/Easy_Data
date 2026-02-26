package handlers

import (
	"fmt"
	"net/http"

	"easydata/internal/models"
	"easydata/internal/services"

	"github.com/gin-gonic/gin"
)

type StaffHandler struct {
	service services.StaffService
}

func NewStaffHandler(service services.StaffService) *StaffHandler {
	return &StaffHandler{service: service}
}

func (h *StaffHandler) GetAllStaff(c *gin.Context) {
	staff, err := h.service.GetAllStaff()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Personel listesi getirilemedi"})
		return
	}
	for i := range staff {
		staff[i].Password = ""
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": staff})
}

func (h *StaffHandler) CreateStaff(c *gin.Context) {
	var req models.Staff
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri", "detail": err.Error()})
		return
	}

	if err := h.service.CreateStaff(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Personel oluşturulamadı", "detail": err.Error()})
		return
	}
	req.Password = ""
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
}

func (h *StaffHandler) UpdateStaff(c *gin.Context) {
	id := c.Param("id")
	var parsedId uint
	fmt.Sscanf(id, "%d", &parsedId)

	var req models.Staff
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri"})
		return
	}
	req.ID = parsedId

	if err := h.service.UpdateStaff(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Personel güncellenemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Personel güncellendi"})
}

func (h *StaffHandler) DeleteStaff(c *gin.Context) {
	id := c.Param("id")
	var parsedId uint
	fmt.Sscanf(id, "%d", &parsedId)

	if err := h.service.DeleteStaff(parsedId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Personel silinemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Personel silindi"})
}
