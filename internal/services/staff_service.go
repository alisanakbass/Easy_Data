package services

import (
	"easydata/internal/models"
	"easydata/internal/repository"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type StaffService interface {
	GetAllStaff() ([]models.Staff, error)
	CreateStaff(req *models.Staff) error
	UpdateStaff(req *models.Staff) error
	DeleteStaff(id uint) error
	Authenticate(username, password string) (*models.Staff, error)
}

type staffService struct {
	repo repository.StaffRepository
}

func NewStaffService(repo repository.StaffRepository) StaffService {
	return &staffService{repo: repo}
}

func (s *staffService) GetAllStaff() ([]models.Staff, error) {
	return s.repo.GetAllStaff()
}

func (s *staffService) CreateStaff(req *models.Staff) error {
	// Şifreyi hashle
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	req.Password = string(hashedPassword)
	return s.repo.CreateStaff(req)
}

func (s *staffService) UpdateStaff(req *models.Staff) error {
	// Eğer şifre boş değilse hashle
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		req.Password = string(hashedPassword)
	} else {
		// Mevcut şifreyi koru
		existing, _ := s.repo.GetStaffByID(req.ID)
		if existing != nil {
			req.Password = existing.Password
		}
	}
	return s.repo.UpdateStaff(req)
}

func (s *staffService) DeleteStaff(id uint) error {
	return s.repo.DeleteStaff(id)
}

func (s *staffService) Authenticate(username, password string) (*models.Staff, error) {
	user, err := s.repo.GetStaffByUsername(username)
	if err != nil {
		return nil, errors.New("kullanıcı bulunamadı")
	}

	if !user.IsActive {
		return nil, errors.New("hesap pasif")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("hatalı şifre")
	}

	return user, nil
}
