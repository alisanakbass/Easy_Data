package repository

import (
	"easydata/internal/models"

	"gorm.io/gorm"
)

type StaffRepository interface {
	GetAllStaff() ([]models.Staff, error)
	GetStaffByID(id uint) (*models.Staff, error)
	GetStaffByUsername(username string) (*models.Staff, error)
	CreateStaff(staff *models.Staff) error
	UpdateStaff(staff *models.Staff) error
	DeleteStaff(id uint) error
}

type staffRepository struct {
	db *gorm.DB
}

func NewStaffRepository(db *gorm.DB) StaffRepository {
	return &staffRepository{db: db}
}

func (r *staffRepository) GetAllStaff() ([]models.Staff, error) {
	var staff []models.Staff
	err := r.db.Find(&staff).Error
	return staff, err
}

func (r *staffRepository) GetStaffByID(id uint) (*models.Staff, error) {
	var s models.Staff
	err := r.db.First(&s, id).Error
	return &s, err
}

func (r *staffRepository) GetStaffByUsername(username string) (*models.Staff, error) {
	var s models.Staff
	err := r.db.Where("username = ?", username).First(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *staffRepository) CreateStaff(staff *models.Staff) error {
	return r.db.Create(staff).Error
}

func (r *staffRepository) UpdateStaff(staff *models.Staff) error {
	return r.db.Save(staff).Error
}

func (r *staffRepository) DeleteStaff(id uint) error {
	return r.db.Delete(&models.Staff{}, id).Error
}
