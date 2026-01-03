from flask import Flask, jsonify, render_template, request, redirect, url_for, session, flash
from rdflib import Graph, Namespace
import sqlite3
import os
import shutil
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = 'jakarta_semantic_harmony_2025'

# --- BACKUP SYSTEM ---
BACKUP_DIR = os.path.join(os.path.dirname(__file__), 'backup')

def backup_database():
    """Backup database otomatis saat server start"""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    db_path = os.path.join(os.path.dirname(__file__), 'sites.db')
    if os.path.exists(db_path):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = os.path.join(BACKUP_DIR, f'sites_backup_{timestamp}.db')
        shutil.copy2(db_path, backup_path)
        print(f"✅ Database di-backup ke: {backup_path}")
        
        # Hapus backup lama (simpan 10 backup terakhir)
        backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith('.db')])
        while len(backups) > 10:
            old_backup = os.path.join(BACKUP_DIR, backups.pop(0))
            os.remove(old_backup)

# --- HELPER FUNCTIONS ---
def parse_koordinat(koordinat_str):
    """Parse koordinat dari format 'lat, lng' menjadi tuple (lat, lng)"""
    if not koordinat_str:
        return None, None
    try:
        parts = koordinat_str.replace(' ', '').split(',')
        if len(parts) >= 2:
            return float(parts[0]), float(parts[1])
    except:
        pass
    return None, None

# --- DATABASE SETUP ---
DATABASE = os.path.join(os.path.dirname(__file__), 'sites.db')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inisialisasi database dengan data awal"""
    conn = get_db()
    c = conn.cursor()
    
    # Buat tabel sites
    c.execute('''
        CREATE TABLE IF NOT EXISTS sites (
            id TEXT PRIMARY KEY,
            nama TEXT NOT NULL,
            alamat TEXT,
            wilayah TEXT,
            kecamatan TEXT,
            kode_pos TEXT,
            tipe TEXT,
            agama TEXT,
            jam_buka TEXT,
            kapasitas INTEGER,
            luas TEXT,
            arsitek TEXT,
            tahun_berdiri INTEGER,
            is_heritage INTEGER DEFAULT 0,
            heritage_code TEXT,
            transport_terdekat TEXT,
            latitude REAL,
            longitude REAL,
            gambar_url TEXT,
            deskripsi TEXT
        )
    ''')
    
    # Buat tabel users
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Insert admin user jika belum ada
    c.execute("SELECT * FROM users WHERE username = 'admin'")
    if not c.fetchone():
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", ('admin', 'jomok123'))
    
    # Insert data awal jika tabel kosong
    c.execute("SELECT COUNT(*) FROM sites")
    if c.fetchone()[0] == 0:
        initial_data = [
            ('MasjidIstiqlal', 'MASJID ISTIQLAL', 'Jl. Taman Wijaya Kusuma No. 1', 'JakartaPusat', 'KecamatanSawahBesar', '10710', 
             'Mosque', 'Islam', '04:00 - 22:00 WIB', 200000, '9.5 Hektar', 'Friedrich Silaban', 1978, 1, None, 'Stasiun Juanda (KRL)',
             -6.170008, 106.831009, '/static/images/istiqlal.jpg', 
             'Masjid Istiqlal adalah masjid terbesar di Asia Tenggara dan menjadi simbol kerukunan beragama di Indonesia. Dibangun atas prakarsa Presiden Soekarno dan dirancang oleh arsitek Kristen Protestan, Friedrich Silaban, sebagai tanda toleransi antar umat beragama.'),
            
            ('MasjidAgungAlAzhar', 'MASJID AGUNG AL-AZHAR', 'Jl. Sisingamangaraja No. 1', 'JakartaSelatan', 'KecamatanKebayoranBaru', '12110',
             'Mosque', 'Islam', '04:00 - 22:00 WIB', 15000, '2.5 Hektar', 'Buya Hamka (Inisiator)', 1958, 0, None, 'Stasiun MRT ASEAN',
             -6.234920731352565, 106.79910971785888, '/static/images/alazhar.jpg',
             'Masjid Agung Al-Azhar adalah salah satu masjid bersejarah di Jakarta yang didirikan atas inisiatif Buya Hamka. Nama Al-Azhar diberikan oleh Grand Syaikh Al-Azhar Mesir sebagai tanda persaudaraan.'),
            
            ('GerejaKatedral', 'GEREJA KATEDRAL JAKARTA', 'Jl. Katedral No. 7B', 'JakartaPusat', 'KecamatanSawahBesar', '10710',
             'Church', 'Katolik', '06:00 - 20:00 WIB', 800, '0.5 Hektar', 'Marius Hulswit', 1901, 1, 'KB000123', 'Halte TransJakarta Juanda',
             -6.169516, 106.832194, '/static/images/katedral.jpg',
             'Gereja Katedral Jakarta atau Gereja Santa Maria Pelindung Diangkat Ke Surga adalah gereja Katolik bergaya neo-gotik yang terletak di Jakarta Pusat, tepat berseberangan dengan Masjid Istiqlal.'),
            
            ('GerejaSion', 'GEREJA SION', 'Jl. Pangeran Jayakarta No. 1', 'JakartaBarat', 'KecamatanTamanSari', '11110',
             'Church', 'KristenProtestan', '08:00 - 17:00 WIB', 400, '0.3 Hektar', None, 1695, 1, 'KB000344', 'Stasiun Jakarta Kota (KRL)',
             -6.137633, 106.813717, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/COLLECTIE_TROPENMUSEUM_De_Portugese_binnenkerk_te_Batavia_TMnr_60015850.jpg/800px-COLLECTIE_TROPENMUSEUM_De_Portugese_binnenkerk_te_Batavia_TMnr_60015850.jpg',
             'Gereja Sion atau GPIB Portugis adalah gereja tertua di Jakarta yang dibangun pada masa VOC. Gereja ini awalnya bernama Gereja Portugis karena dibangun untuk jemaat Portugis di Batavia.'),
            
            ('ViharaSinTekBio', 'VIHARA SIN TEK BIO', 'Jl. Pasar Baru Dalam No. 146', 'JakartaPusat', 'KecamatanSawahBesar', '10710',
             'Vihara', 'Buddha', '06:00 - 18:00 WIB', 500, '0.4 Hektar', None, 1650, 1, 'KB005402', 'Halte TransJakarta Pasar Baru',
             -6.163230, 106.844283, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Jin_de_yuan_-_panoramio.jpg/800px-Jin_de_yuan_-_panoramio.jpg',
             'Vihara Sin Tek Bio atau Jin De Yuan adalah klenteng tertua di Jakarta yang dibangun pada abad ke-17. Vihara ini merupakan tempat ibadah bagi umat Buddha dan Konghucu.'),
            
            ('PuraAdityaJaya', 'PURA ADITYA JAYA', 'Jl. Daksinapati Raya No. 10', 'JakartaTimur', 'KecamatanPuloGadung', '13220',
             'Temple', 'Hindu', '08:00 - 16:00 WIB', 300, '0.6 Hektar', None, 1972, 0, None, 'Halte TransJakarta Velodrome',
             -6.191284, 106.896273, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pura_Aditya_Jaya_%28Rawamangun%2C_Jakarta%29.jpg/800px-Pura_Aditya_Jaya_%28Rawamangun%2C_Jakarta%29.jpg',
             'Pura Aditya Jaya adalah pura Hindu terbesar di Jakarta yang terletak di kawasan Rawamangun. Pura ini menjadi pusat kegiatan keagamaan umat Hindu di ibukota.')
        ]
        
        c.executemany('''
            INSERT INTO sites (id, nama, alamat, wilayah, kecamatan, kode_pos, tipe, agama, jam_buka, kapasitas, 
                              luas, arsitek, tahun_berdiri, is_heritage, heritage_code, transport_terdekat,
                              latitude, longitude, gambar_url, deskripsi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', initial_data)
    
    conn.commit()
    conn.close()

# Inisialisasi database saat aplikasi mulai
init_db()

# --- RDF GRAPH (tetap untuk backward compatibility) ---
g = Graph()
try:
    ttl_path = os.path.join(os.path.dirname(__file__), "ReligiJakarta.ttl")
    g.parse(ttl_path, format="ttl")
    print(f"✅ Berhasil memuat {len(g)} triples dari RDF.")
except Exception as e:
    print(f"⚠️ RDF tidak dimuat: {e}")

print("✅ Database SQLite siap digunakan.")

RJ = Namespace("http://www.semanticweb.org/religion/jakarta#")
SCHEMA = Namespace("http://schema.org/")

# --- LOGIN REQUIRED DECORATOR ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            flash('Silakan login terlebih dahulu.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- AUTH ROUTES ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', 
                           (username, password)).fetchone()
        conn.close()
        
        if user:
            session['logged_in'] = True
            session['username'] = username
            flash('Login berhasil!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Username atau password salah.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Anda telah logout.', 'info')
    return redirect(url_for('home'))

# --- ADMIN ROUTES ---
@app.route('/admin')
@login_required
def admin_dashboard():
    conn = get_db()
    sites = conn.execute('SELECT * FROM sites ORDER BY nama').fetchall()
    conn.close()
    return render_template('admin/dashboard.html', sites=sites)

@app.route('/admin/add', methods=['GET', 'POST'])
@login_required
def admin_add():
    if request.method == 'POST':
        # Parse koordinat dari format gabungan
        lat, lng = parse_koordinat(request.form.get('koordinat'))
        
        data = {
            'id': request.form.get('id'),
            'nama': request.form.get('nama'),
            'alamat': request.form.get('alamat'),
            'wilayah': request.form.get('wilayah'),
            'kecamatan': request.form.get('kecamatan'),
            'kode_pos': request.form.get('kode_pos'),
            'tipe': request.form.get('tipe'),
            'agama': request.form.get('agama'),
            'jam_buka': request.form.get('jam_buka'),
            'kapasitas': request.form.get('kapasitas') or None,
            'luas': request.form.get('luas'),
            'arsitek': request.form.get('arsitek'),
            'tahun_berdiri': request.form.get('tahun_berdiri') or None,
            'is_heritage': 1 if request.form.get('is_heritage') else 0,
            'heritage_code': request.form.get('heritage_code'),
            'transport_terdekat': request.form.get('transport_terdekat'),
            'latitude': lat,
            'longitude': lng,
            'gambar_url': request.form.get('gambar_url'),
            'deskripsi': request.form.get('deskripsi')
        }
        
        conn = get_db()
        try:
            conn.execute('''
                INSERT INTO sites (id, nama, alamat, wilayah, kecamatan, kode_pos, tipe, agama, jam_buka, 
                                  kapasitas, luas, arsitek, tahun_berdiri, is_heritage, heritage_code,
                                  transport_terdekat, latitude, longitude, gambar_url, deskripsi)
                VALUES (:id, :nama, :alamat, :wilayah, :kecamatan, :kode_pos, :tipe, :agama, :jam_buka,
                        :kapasitas, :luas, :arsitek, :tahun_berdiri, :is_heritage, :heritage_code,
                        :transport_terdekat, :latitude, :longitude, :gambar_url, :deskripsi)
            ''', data)
            conn.commit()
            flash('Tempat ibadah berhasil ditambahkan!', 'success')
            return redirect(url_for('admin_dashboard'))
        except sqlite3.IntegrityError:
            flash('ID sudah digunakan. Gunakan ID yang berbeda.', 'danger')
        finally:
            conn.close()
    
    return render_template('admin/form.html', site=None, action='add')

@app.route('/admin/edit/<site_id>', methods=['GET', 'POST'])
@login_required
def admin_edit(site_id):
    conn = get_db()
    
    if request.method == 'POST':
        # Parse koordinat dari format gabungan
        lat, lng = parse_koordinat(request.form.get('koordinat'))
        
        data = {
            'id': site_id,
            'nama': request.form.get('nama'),
            'alamat': request.form.get('alamat'),
            'wilayah': request.form.get('wilayah'),
            'kecamatan': request.form.get('kecamatan'),
            'kode_pos': request.form.get('kode_pos'),
            'tipe': request.form.get('tipe'),
            'agama': request.form.get('agama'),
            'jam_buka': request.form.get('jam_buka'),
            'kapasitas': request.form.get('kapasitas') or None,
            'luas': request.form.get('luas'),
            'arsitek': request.form.get('arsitek'),
            'tahun_berdiri': request.form.get('tahun_berdiri') or None,
            'is_heritage': 1 if request.form.get('is_heritage') else 0,
            'heritage_code': request.form.get('heritage_code'),
            'transport_terdekat': request.form.get('transport_terdekat'),
            'latitude': lat,
            'longitude': lng,
            'gambar_url': request.form.get('gambar_url'),
            'deskripsi': request.form.get('deskripsi')
        }
        
        conn.execute('''
            UPDATE sites SET nama=:nama, alamat=:alamat, wilayah=:wilayah, kecamatan=:kecamatan,
                   kode_pos=:kode_pos, tipe=:tipe, agama=:agama, jam_buka=:jam_buka, kapasitas=:kapasitas,
                   luas=:luas, arsitek=:arsitek, tahun_berdiri=:tahun_berdiri, is_heritage=:is_heritage,
                   heritage_code=:heritage_code, transport_terdekat=:transport_terdekat, latitude=:latitude,
                   longitude=:longitude, gambar_url=:gambar_url, deskripsi=:deskripsi
            WHERE id=:id
        ''', data)
        conn.commit()
        conn.close()
        flash('Tempat ibadah berhasil diperbarui!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    site = conn.execute('SELECT * FROM sites WHERE id = ?', (site_id,)).fetchone()
    conn.close()
    
    if not site:
        flash('Tempat ibadah tidak ditemukan.', 'danger')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('admin/form.html', site=site, action='edit')

@app.route('/admin/delete/<site_id>', methods=['POST'])
@login_required
def admin_delete(site_id):
    conn = get_db()
    conn.execute('DELETE FROM sites WHERE id = ?', (site_id,))
    conn.commit()
    conn.close()
    flash('Tempat ibadah berhasil dihapus!', 'success')
    return redirect(url_for('admin_dashboard'))

# --- PAGE ROUTES ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/jelajahi')
def jelajahi():
    return render_template('jelajahi.html')

@app.route('/detail/<site_id>')
def detail(site_id):
    return render_template('detail.html', site_id=site_id)

@app.route('/kalender')
def kalender():
    return render_template('kalender.html')

@app.route('/tentang')
def tentang():
    return render_template('tentang.html')

# --- API ENDPOINTS (dari Database) ---
@app.route('/api/sites', methods=['GET'])
def get_all_sites():
    conn = get_db()
    sites = conn.execute('SELECT * FROM sites ORDER BY nama').fetchall()
    conn.close()
    
    result = []
    for site in sites:
        result.append({
            'id': site['id'],
            'nama': site['nama'],
            'alamat': site['alamat'],
            'wilayah': site['wilayah'],
            'kecamatan': site['kecamatan'],
            'kode_pos': site['kode_pos'],
            'tipe': site['tipe'],
            'agama': site['agama'],
            'jam_buka': site['jam_buka'],
            'kapasitas': site['kapasitas'],
            'luas': site['luas'],
            'arsitek': site['arsitek'],
            'tahun': site['tahun_berdiri'],
            'is_heritage': bool(site['is_heritage']),
            'heritage_code': site['heritage_code'],
            'transport_terdekat': site['transport_terdekat'],
            'latitude': site['latitude'],
            'longitude': site['longitude'],
            'gambar_url': site['gambar_url'],
            'deskripsi': site['deskripsi']
        })
    
    return jsonify(result)

@app.route('/api/site/<site_id>', methods=['GET'])
def get_site(site_id):
    conn = get_db()
    site = conn.execute('SELECT * FROM sites WHERE id = ?', (site_id,)).fetchone()
    conn.close()
    
    if not site:
        return jsonify({'error': 'Site not found'}), 404
    
    return jsonify({
        'id': site['id'],
        'nama': site['nama'],
        'alamat': site['alamat'],
        'wilayah': site['wilayah'],
        'kecamatan': site['kecamatan'],
        'kode_pos': site['kode_pos'],
        'tipe': site['tipe'],
        'agama': site['agama'],
        'jam_buka': site['jam_buka'],
        'kapasitas': site['kapasitas'],
        'luas': site['luas'],
        'arsitek': site['arsitek'],
        'tahun_berdiri': site['tahun_berdiri'],
        'is_heritage': bool(site['is_heritage']),
        'heritage_code': site['heritage_code'],
        'transport_terdekat': site['transport_terdekat'],
        'latitude': site['latitude'],
        'longitude': site['longitude'],
        'gambar_url': site['gambar_url'],
        'deskripsi': site['deskripsi']
    })

@app.route('/api/locations', methods=['GET'])
def get_locations():
    conn = get_db()
    locations = conn.execute('SELECT DISTINCT wilayah FROM sites WHERE wilayah IS NOT NULL ORDER BY wilayah').fetchall()
    conn.close()
    return jsonify([loc['wilayah'] for loc in locations])

@app.route('/api/religions', methods=['GET'])
def get_religions():
    conn = get_db()
    religions = conn.execute('SELECT DISTINCT agama FROM sites WHERE agama IS NOT NULL ORDER BY agama').fetchall()
    conn.close()
    return jsonify([rel['agama'] for rel in religions])

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    total_sites = conn.execute('SELECT COUNT(*) FROM sites').fetchone()[0]
    total_heritage = conn.execute('SELECT COUNT(*) FROM sites WHERE is_heritage = 1').fetchone()[0]
    conn.close()
    return jsonify({
        'total_sites': total_sites,
        'total_heritage': total_heritage
    })

if __name__ == '__main__':
    backup_database()  # Backup otomatis saat server start
    app.run(debug=True, port=1083)
