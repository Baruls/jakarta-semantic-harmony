# Jakarta Semantic Harmony

**Website Pemetaan Tempat Ibadah di Jakarta dengan Semantic Web Technology**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.2-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 Deskripsi

Jakarta Semantic Harmony adalah aplikasi web berbasis Semantic Web yang menyediakan informasi lengkap tentang tempat-tempat ibadah di Jakarta. Website ini menggunakan RDF (Resource Description Framework) untuk merepresentasikan data secara terstruktur dan dapat dimengerti oleh mesin.

### ✨ Fitur Utama

- 🗺️ **Peta Interaktif** - Visualisasi lokasi tempat ibadah menggunakan Leaflet.js
- 🔍 **Pencarian & Filter** - Filter berdasarkan agama, wilayah, dan status cagar budaya
- 📍 **Detail Lokasi** - Informasi lengkap termasuk koordinat, jam operasional, kapasitas, dll
- 📅 **Kalender Acara** - Informasi acara keagamaan di berbagai tempat ibadah
- 🏛️ **Status Cagar Budaya** - Identifikasi bangunan bersejarah
- 🔐 **Admin CRUD** - Sistem manajemen data untuk admin
- 💾 **Auto Backup** - Backup database otomatis setiap server restart

### 🛕 Agama yang Dicakup

- Islam (Masjid)
- Kristen Katolik (Gereja)
- Kristen Protestan (Gereja)
- Buddha (Vihara)
- Hindu (Pura)
- Konghucu (Kelenteng)

## 🚀 Instalasi

### Prasyarat

- Python 3.9 atau lebih tinggi
- pip (Python package manager)
- Git (opsional)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/jakarta-semantic-harmony.git
   cd jakarta-semantic-harmony
   ```

2. **Buat virtual environment**
   ```bash
   python -m venv .venv
   ```

3. **Aktifkan virtual environment**
   - Windows:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Jalankan aplikasi**
   
   **Mode Development:**
   ```bash
   python app.py
   ```
   
   **Mode Production:**
   ```bash
   python run_production.py
   ```

6. **Akses aplikasi**
   - Development: `http://127.0.0.1:1081`
   - Production: `http://0.0.0.0:1081` (bisa diakses dari jaringan lokal)

## 📁 Struktur Project

```
jakarta-semantic-harmony/
├── app.py                 # Aplikasi Flask utama
├── run_production.py      # Script untuk production mode
├── requirements.txt       # Python dependencies
├── ReligiJakarta.ttl     # Data RDF/Turtle
├── sites.db              # Database SQLite (auto-generated)
├── static/
│   ├── css/
│   │   └── style.css     # Stylesheet utama
│   ├── images/           # Gambar tempat ibadah
│   └── js/
│       ├── main.js       # JavaScript utama
│       ├── map.js        # Logic peta
│       ├── jelajahi.js   # Logic halaman jelajahi
│       ├── detail.js     # Logic halaman detail
│       └── kalender.js   # Logic kalender
├── templates/
│   ├── base.html         # Template dasar
│   ├── index.html        # Halaman beranda
│   ├── jelajahi.html     # Halaman jelajahi
│   ├── detail.html       # Halaman detail
│   ├── kalender.html     # Halaman kalender
│   ├── tentang.html      # Halaman tentang
│   ├── login.html        # Halaman login admin
│   └── admin/
│       ├── dashboard.html
│       └── form.html
└── backup/               # Backup database otomatis
```

## 🔐 Admin CRUD

Akses halaman admin untuk mengelola data tempat ibadah.

**Login Credentials:**
- Username: `admin`
- Password: `jomok123`

**Fitur Admin:**
- ➕ Tambah tempat ibadah baru
- ✏️ Edit informasi tempat ibadah
- 🗑️ Hapus tempat ibadah
- 📊 Dashboard statistik

**Akses:** Klik icon user kecil di pojok kanan navbar (hover untuk melihat)

## 🗄️ Database

Aplikasi menggunakan SQLite untuk menyimpan data. Database akan dibuat otomatis saat pertama kali aplikasi dijalankan.

**Backup Otomatis:**
- Database di-backup setiap kali server restart
- Backup disimpan di folder `backup/`
- Maksimal 10 backup terbaru disimpan

**Restore Manual:**
```powershell
Copy-Item "backup\sites_backup_TIMESTAMP.db" -Destination "sites.db"
```

## 🌐 Deployment

### Untuk Akses Jaringan Lokal

Edit `app.py` dan jalankan:
```python
app.run(host='0.0.0.0', port=1081)
```

Akses dari komputer lain: `http://[IP_ADDRESS]:1081`

### Untuk Production Server

Gunakan WSGI server seperti Waitress (sudah include di requirements.txt):

```python
# run_production.py
from waitress import serve
from app import app

if __name__ == '__main__':
    print("🚀 Server running on http://0.0.0.0:1081")
    serve(app, host='0.0.0.0', port=1081, threads=4)
```

Jalankan:
```bash
python run_production.py
```

## 🛠️ Teknologi yang Digunakan

### Backend
- **Flask 3.1.2** - Web framework
- **RDFLib 6.3.2** - RDF processing
- **SQLite** - Database
- **Waitress** - Production WSGI server

### Frontend
- **HTML5 & CSS3**
- **JavaScript (Vanilla)**
- **Leaflet.js** - Interactive maps
- **Font Awesome 6.4.0** - Icons
- **Google Fonts (Poppins)** - Typography

### Data Format
- **RDF/Turtle (.ttl)** - Semantic data representation
- **SQLite** - Relational database

## 📊 API Endpoints

- `GET /api/sites` - Mendapatkan semua tempat ibadah
- `GET /api/site/<id>` - Mendapatkan detail tempat ibadah
- `GET /api/locations` - Mendapatkan daftar wilayah
- `GET /api/stats` - Mendapatkan statistik (total sites, cagar budaya)

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tim Pengembang

**Kelompok 1**
- Member 1
- Member 2
- Member 3
- Member 4

## 📞 Kontak

Project Link: [https://github.com/yourusername/jakarta-semantic-harmony](https://github.com/yourusername/jakarta-semantic-harmony)

## 🙏 Acknowledgments

- OpenStreetMap untuk peta dasar
- Leaflet.js untuk library peta interaktif
- Font Awesome untuk icon
- Wikipedia untuk beberapa gambar tempat ibadah

---

⭐ Jangan lupa beri star jika project ini bermanfaat!
