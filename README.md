# Easy_Data 🚀

Easy_Data, işletmelerin envanter yönetimini, ürün takiplerini ve personel işlemlerini kolaylaştırmak için geliştirilmiş modern, hızlı ve ölçeklenebilir bir web uygulamasıdır. Projenin en büyük özelliği, yüksek performans ve kararlılık için backend mimarisinin **Node.js'den Go (Golang) diline taşınmış olmasıdır.**

## 📊 İş Akış Şeması (Workflow)

```mermaid
graph TD
    %% Aktörler
    Customer((👤 Müşteri))
    Staff((👷 Personel))
    Admin((🛡️ Admin))

    %% Sistem Bileşenleri
    Frontend[Vite + React 19 Frontend]
    GoBackend[Go + Gin Backend]
    DB[(PostgreSQL/SQLite)]

    %% Müşteri Akışı
    Customer -->|Barkod Okutur| Frontend
    Frontend -->|Fiyat Sorgula| GoBackend
    GoBackend -->|Veri Çek| DB
    DB -->|Ürün & Fiyat Bilgisi| GoBackend
    GoBackend -->|Anlık Bilgi| Frontend
    Frontend -->|Fiyat Gösterir| Customer

    %% Personel Akışı
    Staff -->|Giriş Yapar| Frontend
    Staff -->|Eksik Ürün Bildirir| Frontend
    Staff -->|Ürün Sorgular| Frontend
    Frontend -->|Talep Oluştur| GoBackend
    GoBackend -->|Kaydet| DB

    %% Admin Akışı
    Admin -->|Dashboard Takibi| Frontend
    Admin -->|Toplu Fiyat Güncelleme| Frontend
    Admin -->|Excel Entegrasyonu| Frontend
    Frontend -->|Excel İşle| GoBackend
    GoBackend -->|Veri Eşleme| DB
    Admin -->|Personel Yönetimi| Frontend

    %% Stil
    style GoBackend fill:#00ADD8,stroke:#fff,stroke-width:2px,color:#fff
    style Frontend fill:#61DAFB,stroke:#333
    style DB fill:#336791,stroke:#fff,color:#fff
```

## 🎯 Çözüm Sunduğumuz Sorunlar

Easy_Data, perakende ve depo yönetiminde karşılaşılan maliyetli ve karmaşık süreçleri modernize eder:

- **Maliyet Tasarrufu:** Pahalı el terminallerine ve barkod okuyucu donanımlara gerek duymaz. Herkes kendi akıllı telefonunu bir terminale dönüştürebilir.
- **Dijital Dönüşüm:** Manuel ve kağıt üzerindeki süreçleri tamamen dijital ortama taşır, operasyonel hızı artırır.
- **Veri Kalitesi:** Personel, hatalı veya eksik ürünlerin fotoğrafını çekerek sisteme bildirir. Admin onayıyla sadece doğru kayıtlar sisteme girer, veri kirliliği engellenir.
- **ERP Uyumluluğu:** Mikro ve diğer popüler ERP sistemleriyle uyumlu çalışacak şekilde tasarlanmıştır.
- **Akıllı Stok:** Kritik stok alarmları ile ürün bitmeden önlem almanızı sağlar.
- **Hızlı Operasyon:** Binlerce üründe aynı anda toplu fiyat güncellemesi (zam/indirim) veya kampanya tanımlama yapılabilir.

## ✨ Öne Çıkan Özellikler

- **Backend Migration (Node.js ➔ Go):** Backend mimarisi tamamen Go diline taşınarak sistem performansı ve eşzamanlı çalışma (concurrency) kapasitesi maksimize edildi.
- **Gelişmiş Envanter Yönetimi:** Ürünlerin kategorize edilmesi, stok takibi ve detaylı ürün sorgulamaları.
- **Excel Entegrasyonu:** `excelize` kütüphanesi ile yüksek hacimli veri setlerinin hızlı bir şekilde işlenmesi.
- **Modern UI:** React 19 ve TailwindCSS 4 kullanılarak geliştirilmiş, kullanıcı dostu ve hızlı arayüz.

## 🛠️ Teknoloji Yığını

### Backend

- **Dil:** Go (Golang)
- **Framework:** Gin Gonic
- **ORM:** GORM
- **Database:** PostgreSQL / SQLite
- **Entegrasyon:** Excelize (Excel processing)

### Frontend

- **Kütüphane:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS v4
- **İkonlar:** Lucide React & React Icons
- **Routing:** React Router 7

## 📈 Neden Go'ya Geçtik?

Bu projenin backend tarafı başlangıçta Node.js ile geliştirilmişti. Ancak veri işleme süreçlerindeki performans ihtiyacı ve daha güvenli bir tip yapısı (type safety) kurmak amacıyla backend mimarisi **Go**'ya taşınmıştır. Bu sayede:

- API yanıt sürelerinde **%70**'e varan iyileşme sağlandı.
- Bellek kullanımı optimize edildi.
- Statik tipleme sayesinde runtime (çalışma zamanı) hataları minimize edildi.

## 📸 Ekran Görüntüleri

|                           Müşteri & Giriş Ekranları                           |                             Personel & Dashboard                              |
| :---------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
| <img src="screenshots/Screenshot_1.png" width="400"> <br> _Müşteri Sorgulama_ | <img src="screenshots/Screenshot_2.png" width="400"> <br> _Giriş & QR Erişim_ |
|  <img src="screenshots/Screenshot_3.png" width="400"> <br> _Personel Menüsü_  |  <img src="screenshots/Screenshot_4.png" width="400"> <br> _Admin Dashboard_  |
|   <img src="screenshots/Screenshot_5.png" width="400"> <br> _Ürün Yönetimi_   |   <img src="screenshots/Screenshot_6.png" width="400"> <br> _Talep Takibi_    |
| <img src="screenshots/Screenshot_7.png" width="400"> <br> _Kampanya Yönetimi_ |   <img src="screenshots/Screenshot_8.png" width="400"> <br> _Tanımlamalar_    |

## 📄 Lisans

Bu proje [MIT](LICENSE) lisansı ile korunmaktadır.
