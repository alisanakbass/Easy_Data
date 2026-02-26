package repository

import (
	"easydata/internal/models"

	"gorm.io/gorm"
)

type ProductRequestRepository struct {
	db *gorm.DB
}

func NewProductRequestRepository(db *gorm.DB) *ProductRequestRepository {
	return &ProductRequestRepository{db: db}
}

func (r *ProductRequestRepository) Create(req *models.ProductRequest) error {
	return r.db.Create(req).Error
}

func (r *ProductRequestRepository) FindAll(status string) ([]models.ProductRequest, error) {
	var requests []models.ProductRequest
	query := r.db.Model(&models.ProductRequest{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Order("created_at desc").Find(&requests).Error
	return requests, err
}

func (r *ProductRequestRepository) FindByID(id uint) (*models.ProductRequest, error) {
	var req models.ProductRequest
	err := r.db.First(&req, id).Error
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *ProductRequestRepository) Update(req *models.ProductRequest) error {
	return r.db.Save(req).Error
}

func (r *ProductRequestRepository) Delete(id uint) error {
	return r.db.Delete(&models.ProductRequest{}, id).Error
}
