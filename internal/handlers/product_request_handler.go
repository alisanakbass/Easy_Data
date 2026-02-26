package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"easydata/internal/services"

	"github.com/gin-gonic/gin"
)

type ProductRequestHandler struct {
	service *services.ProductRequestService
}

func NewProductRequestHandler(service *services.ProductRequestService) *ProductRequestHandler {
	return &ProductRequestHandler{service: service}
}

// Personel için: Eksik ürün talebi oluştur ve resmi yükle
func (h *ProductRequestHandler) CreateRequest(c *gin.Context) {
	barcode := c.PostForm("barcode")
	stockStr := c.PostForm("stock_quantity")
	if barcode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Barkod zorunludur"})
		return
	}

	stockQty, err := strconv.ParseFloat(stockStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçerli bir stok miktarı giriniz"})
		return
	}

	// Dosyayı al
	file, err := c.FormFile("image")
	var imageURL string
	if err == nil {
		// Yükleme klasörünü oluştur (yoksa)
		if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Klasör oluşturulamadı"})
			return
		}

		// Dosya ismini benzersiz yap
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("%s_%d%s", barcode, time.Now().Unix(), ext)
		dst := filepath.Join("uploads", filename)

		// Dosyayı kaydet
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Dosya kaydedilemedi"})
			return
		}

		imageURL = "/" + dst // frontend tarafında erişim için path
	}

	req, err := h.service.CreateProductRequest(barcode, stockQty, imageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "Talep başarıyla oluşturuldu"})
}

// Admin için: Tüm talepleri getir (duruma göre)
func (h *ProductRequestHandler) GetAllRequests(c *gin.Context) {
	status := c.Query("status")
	requests, err := h.service.GetAllRequests(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": requests})
}

// Admin için: Talebin durumunu güncelle (onaylama vs.)
func (h *ProductRequestHandler) UpdateRequestStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ID"})
		return
	}

	var input struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.service.UpdateRequestStatus(uint(id), input.Status, input.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Durum güncellendi"})
}

func (h *ProductRequestHandler) DeleteRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ID"})
		return
	}

	err = h.service.DeleteRequest(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Talep silindi"})
}
