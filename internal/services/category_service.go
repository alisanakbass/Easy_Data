package services

import (
	"easydata/internal/models"
	"easydata/internal/repository"
)

type CategoryService interface {
	GetAllCategories() ([]models.Category, error)
	CreateCategory(req *models.Category) error
	UpdateCategory(req *models.Category) error
	DeleteCategory(id uint) error
}

type categoryService struct {
	repo repository.CategoryRepository
}

func NewCategoryService(repo repository.CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) GetAllCategories() ([]models.Category, error) {
	return s.repo.GetAllCategories()
}

func (s *categoryService) CreateCategory(req *models.Category) error {
	return s.repo.CreateCategory(req)
}

func (s *categoryService) UpdateCategory(req *models.Category) error {
	return s.repo.UpdateCategory(req)
}

func (s *categoryService) DeleteCategory(id uint) error {
	return s.repo.DeleteCategory(id)
}
