# Jakarta Semantic Harmony

**Semantic Web-Based Platform for Mapping Religious Sites in Jakarta**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.2-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 Description

Jakarta Semantic Harmony is a semantic web-based application that provides comprehensive information about religious worship sites in Jakarta. This website utilizes RDF (Resource Description Framework) to represent data in a structured and machine-understandable format.

### ✨ Key Features

- 🗺️ **Interactive Map** - Visualize religious site locations using Leaflet.js
- 🔍 **Search & Filter** - Filter by religion, district, and heritage status
- 📍 **Location Details** - Complete information including coordinates, operating hours, capacity, etc.
- 📅 **Event Calendar** - Information about religious events at various worship sites
- 🏛️ **Heritage Status** - Identification of historical buildings
- 💾 **Auto Backup** - Automatic database backup on every server restart

### 🛕 Religions Covered

- Islam (Mosque)
- Catholic Christianity (Church)
- Protestant Christianity (Church)
- Buddhism (Temple)
- Hinduism (Pura)
- Confucianism (Temple)

## 🚀 Installation

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Git (optional)

### Installation Steps

1. **Clone repository**
   ```bash
   git clone https://github.com/Baruls/jakarta-semantic-harmony.git
   cd jakarta-semantic-harmony
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment**
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

5. **Run application**
   
   **Development Mode:**
   ```bash
   python app.py
   ```
   
   **Production Mode:**
   ```bash
   python run_production.py
   ```

6. **Access application**
   - Development: `http://127.0.0.1:1081`
   - Production: `http://0.0.0.0:1081` (accessible from local network)

## 📁 Project Structure

```
jakarta-semantic-harmony/
├── app.py                 # Main Flask application
├── run_production.py      # Production mode script
├── requirements.txt       # Python dependencies
├── ReligiJakarta.ttl     # RDF/Turtle data
├── sites.db              # SQLite database (auto-generated)
├── static/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── images/           # Religious site images
│   └── js/
│       ├── main.js       # Main JavaScript
│       ├── map.js        # Map logic
│       ├── jelajahi.js   # Browse page logic
│       ├── detail.js     # Detail page logic
│       └── kalender.js   # Calendar logic
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Home page
│   ├── jelajahi.html     # Browse page
│   ├── detail.html       # Detail page
│   ├── kalender.html     # Calendar page
│   └── tentang.html      # About page
└── backup/               # Automatic database backups
```

## 🗄️ Database

The application uses SQLite to store data. The database is automatically created when the application runs for the first time.

**Automatic Backup:**
- Database is backed up every time the server restarts
- Backups are stored in the `backup/` folder
- Maximum of 10 recent backups are kept

**Manual Restore:**
```powershell
Copy-Item "backup\sites_backup_TIMESTAMP.db" -Destination "sites.db"
```

## 🌐 Deployment

### For Local Network Access

Edit `app.py` and run:
```python
app.run(host='0.0.0.0', port=1081)
```

Access from other computers: `http://[IP_ADDRESS]:1081`

### For Production Server

Use WSGI server like Waitress (included in requirements.txt):

```python
# run_production.py
from waitress import serve
from app import app

if __name__ == '__main__':
    print("🚀 Server running on http://0.0.0.0:1081")
    serve(app, host='0.0.0.0', port=1081, threads=4)
```

Run:
```bash
python run_production.py
```

## 🛠️ Technologies Used

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

- `GET /api/sites` - Get all religious sites
- `GET /api/site/<id>` - Get religious site details
- `GET /api/locations` - Get list of districts
- `GET /api/stats` - Get statistics (total sites, heritage sites)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

##  Contact

Project Link: [https://github.com/Baruls/jakarta-semantic-harmony](https://github.com/Baruls/jakarta-semantic-harmony)

## 🙏 Acknowledgments

- OpenStreetMap for base maps
- Leaflet.js for interactive map library
- Font Awesome for icons
- Wikipedia for some religious site images

---

⭐ Don't forget to star this project if you find it useful!
