package handlers

import (
	"easydata/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthHandler - Sisteme giriş işlemleri için
type AuthHandler struct {
	staffService services.StaffService
}

func NewAuthHandler(staffService services.StaffService) *AuthHandler {
	return &AuthHandler{staffService: staffService}
}

// Login - Admin ve Personel paneli girişi
func (h *AuthHandler) Login(c *gin.Context) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz giriş bilgileri"})
		return
	}

	// Veritabanından kullanıcıyı doğrula
	user, err := h.staffService.Authenticate(loginData.Username, loginData.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Başarılı Giriş
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   "dummy-token-for-" + user.Role, // İleride gerçek JWT ile değiştirilebilir
		"role":    user.Role,
		"user":    user,
		"message": "Giriş başarılı!",
	})
}
