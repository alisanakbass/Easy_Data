package main

import (
	"fmt"
	"log"

	"easydata/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("easydata.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Veritabanına bağlanılamadı:", err)
	}

	// Tabloyu oluştur
	db.AutoMigrate(&models.Location{})

	locations := []models.Location{
		{Name: "Ana Depo", Type: "warehouse"},
		{Name: "Ön Raf", Type: "shelf"},
		{Name: "Soğuk Hava Deposu", Type: "warehouse"},
	}

	for _, loc := range locations {
		if err := db.FirstOrCreate(&loc, models.Location{Name: loc.Name}).Error; err != nil {
			fmt.Printf("Lokasyon eklerken hata: %v\n", err)
		} else {
			fmt.Printf("Eklendi/Var: %s\n", loc.Name)
		}
	}
	fmt.Println("Lokasyonlar başarıyla eklendi.")
}
