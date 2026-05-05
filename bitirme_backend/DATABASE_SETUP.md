# 🗄️ Database Kurulum Kılavuzu

## ⚠️ Sorun
Backend MySQL'e bağlanamıyor:
- `Access denied for user 'root'@'localhost' (using password: YES)`

## ✅ Çözüm

### Seçenek 1: Docker ile MySQL Kurulumu (Tavsiye Edilen)

```bash
# Docker'da MySQL 8.0 başlat
docker run --name mysql-pillreminder -e MYSQL_ROOT_PASSWORD=347834 -e MYSQL_DATABASE=pill_reminder -p 3306:3306 -d mysql:8.0

# Durum kontrol et
docker ps | grep mysql-pillreminder

# MySQL'e bağlan (test)
docker exec -it mysql-pillreminder mysql -u root -p347834 -e "SELECT VERSION();"
```

### Seçenek 2: Homebrew ile macOS'a Kurulum

```bash
# MySQL'i kur
brew install mysql

# Servisi başlat
brew services start mysql

# Root şifresi oluştur
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '347834';"

# Database ve tabloları oluştur
node setup_db.js
```

### Seçenek 3: Manual Kurulum (Windows/Linux)

1. [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) indir
2. Kurulumu tamamla (root şifresi: `347834`)
3. Terminal'de çalıştır:
   ```bash
   node setup_db.js
   ```

## 🔧 Database Kurulduktan Sonra

```bash
# Backend'i başlat
npm start

# Kontrol et
curl http://localhost:3004/health
# Çıktı: {"status":"OK","message":"Server is running with database!"}
```

## 📊 Veritabanı Bilgileri

| Ayar | Değer |
|------|-------|
| Host | localhost |
| Port | 3306 |
| Username | root |
| Password | 347834 |
| Database | pill_reminder |

## ❓ Problem Devam Ediyorsa

```bash
# 1. MySQL bağlantısını test et
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({host:'localhost', user:'root', password:'347834'}).then(c => {console.log('✅ Bağlandı!'); c.end();}).catch(e => {console.log('❌ Hata:', e.message);})"

# 2. Docker'da MySQL çalışıyor mu kontrol et
docker ps

# 3. MySQL servisini yeniden başlat
brew services restart mysql  # macOS

# 4. Port 3306 açık mı kontrol et
lsof -i :3306
```
