package services

import (
	"easydata/internal/models"
	"easydata/internal/repository"
	"errors"
)

type ProductRequestService struct {
	repo *repository.ProductRequestRepository
}

func NewProductRequestService(repo *repository.ProductRequestRepository) *ProductRequestService {
	return &ProductRequestService{repo: repo}
}

func (s *ProductRequestService) CreateProductRequest(barcode string, stockQuantity float64, imageURL string) (*models.ProductRequest, error) {
	if barcode == "" {
		return nil, errors.New("barkod boş olamaz")
	}
	req := &models.ProductRequest{
		Barcode:       barcode,
		StockQuantity: stockQuantity,
		ImageURL:      imageURL,
		Status:        "pending",
	}
	err := s.repo.Create(req)
	return req, err
}

func (s *ProductRequestService) GetAllRequests(status string) ([]models.ProductRequest, error) {
	return s.repo.FindAll(status)
}

func (s *ProductRequestService) GetRequestByID(id uint) (*models.ProductRequest, error) {
	return s.repo.FindByID(id)
}

func (s *ProductRequestService) UpdateRequestStatus(id uint, status string, notes string) error {
	req, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	req.Status = status
	if notes != "" {
		req.Notes = notes
	}
	return s.repo.Update(req)
}

func (s *ProductRequestService) DeleteRequest(id uint) error {
	return s.repo.Delete(id)
}
