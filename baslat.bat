@echo off
echo Proje bilesenleri baslatiliyor...

:: Go Backend'i baslat
start cmd /k "go run cmd/server/main.go"

:: Vue/React Frontend'i baslat
start cmd /k "cd frontend && npm run dev"
