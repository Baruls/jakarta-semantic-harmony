from flask import Flask, jsonify, render_template, request, redirect, url_for, session, flash
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, XSD
import os
import shutil
# import requests  # Optional: untuk Calendarific API (belum aktif)
from datetime import datetime
from functools import wraps
# hijri-converter not available, will use manual data instead

app = Flask(__name__)
app.secret_key = 'jakarta_semantic_harmony_2025'

# --- API CONFIGURATION ---
CALENDARIFIC_API_KEY = os.environ.get('CALENDARIFIC_API_KEY', '')  # Optional: set in environment
CALENDARIFIC_URL = 'https://calendarific.com/api/v2/holidays'

# --- TTL FILE PATH ---
TTL_FILE = os.path.join(os.path.dirname(__file__), 'ReligiJakarta.ttl')
BACKUP_DIR = os.path.join(os.path.dirname(__file__), 'backup')

# --- NAMESPACES ---
REL = Namespace("http://jakartaharmony.id/religijkt#")
GEO = Namespace("http://www.w3.org/2003/01/geo/wgs84_pos#")
SCHEMA = Namespace("http://schema.org/")

# --- GLOBAL RDF GRAPH ---
g = Graph()
g.bind("rel", REL)
g.bind("geo", GEO)
g.bind("schema", SCHEMA)

# --- BACKUP SYSTEM ---
def backup_ttl():
    """Backup TTL file otomatis"""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    if os.path.exists(TTL_FILE):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = os.path.join(BACKUP_DIR, f'ReligiJakarta_backup_{timestamp}.ttl')
        shutil.copy2(TTL_FILE, backup_path)
        print(f"✅ TTL di-backup ke: {backup_path}")
        
        # Hapus backup lama (simpan 10 backup terakhir)
        backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.startswith('ReligiJakarta_backup_') and f.endswith('.ttl')])
        while len(backups) > 10:
            old_backup = os.path.join(BACKUP_DIR, backups.pop(0))
            os.remove(old_backup)

def load_graph():
    """Load RDF graph dari TTL file"""
    global g
    g = Graph()
    g.bind("rel", REL)
    g.bind("geo", GEO)
    g.bind("schema", SCHEMA)
    
    try:
        g.parse(TTL_FILE, format="ttl")
        print(f"✅ Berhasil memuat {len(g)} triples dari {TTL_FILE}")
    except Exception as e:
        print(f"⚠️ Error loading TTL: {e}")

def save_graph():
    """Simpan RDF graph ke TTL file dan backup"""
    try:
        backup_ttl()  # Backup dulu sebelum save
        g.serialize(destination=TTL_FILE, format="turtle")
        print(f"✅ Graph berhasil disimpan ke {TTL_FILE}")
        return True
    except Exception as e:
        print(f"❌ Error saving TTL: {e}")
        return False

# Load graph saat startup
load_graph()

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

def get_site_from_graph(site_id):
    """Ambil data site dari RDF graph"""
    site_uri = REL[site_id]
    
    # Cek apakah site exist (gunakan TempatIbadah dari TTL)
    if (site_uri, RDF.type, REL.TempatIbadah) not in g:
        return None
    
    # Ambil semua properti
    site = {'id': site_id}
    
    # Properties sesuai dengan TTL yang ada
    props_map = {
        REL.nama: 'nama',
        SCHEMA.address: 'alamat',
        REL.wilayah: 'wilayah',
        REL.kecamatan: 'kecamatan',
        REL.kodePos: 'kode_pos',
        REL.tipeBangunan: 'tipe',
        REL.agama: 'agama',
        REL.jamOperasional: 'jam_buka',
        REL.kapasitas: 'kapasitas',
        REL.luasLahan: 'luas',
        REL.arsitek: 'arsitek',
        REL.tahunBerdiri: 'tahun_berdiri',
        REL.statusCagarBudaya: 'is_heritage',
        REL.kodeCagarBudaya: 'heritage_code',
        REL.transportTerdekat: 'transport_terdekat',
        GEO.lat: 'latitude',
        GEO.long: 'longitude',
        SCHEMA.image: 'gambar_url',
        SCHEMA.description: 'deskripsi'
    }
    
    for pred, key in props_map.items():
        # Transport bisa multiple values
        if pred == REL.transportTerdekat:
            values = list(g.objects(site_uri, pred))
            if values:
                site[key] = ', '.join([str(v) for v in values])
            else:
                site[key] = None
        else:
            value = g.value(site_uri, pred)
            if value:
                if key in ['kapasitas']:
                    site[key] = int(value)
                elif key == 'tahun_berdiri':
                    # Handle gYear format
                    site[key] = int(str(value)[:4])
                elif key in ['latitude', 'longitude']:
                    site[key] = float(value)
                elif key == 'is_heritage':
                    site[key] = str(value).lower() == 'true'
                else:
                    site[key] = str(value)
            else:
                site[key] = None
    
    return site

def get_all_sites_from_graph():
    """Ambil semua sites dari RDF graph"""
    sites = []
    for site_uri in g.subjects(RDF.type, REL.TempatIbadah):
        site_id = str(site_uri).split('#')[-1]
        site = get_site_from_graph(site_id)
        if site:
            sites.append(site)
    return sorted(sites, key=lambda x: x.get('nama', ''))

# --- HARDCODED USER (sementara) ---
ADMIN_USER = {'username': 'admin', 'password': 'jomok123'}


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
        
        if username == ADMIN_USER['username'] and password == ADMIN_USER['password']:
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
    sites = get_all_sites_from_graph()
    return render_template('admin/dashboard.html', sites=sites)


@app.route('/admin/add', methods=['GET', 'POST'])
@login_required
def admin_add():
    if request.method == 'POST':
        site_id = request.form.get('id')
        site_uri = REL[site_id]
        
        # Cek apakah ID sudah ada
        if (site_uri, RDF.type, REL.TempatIbadah) in g:
            flash('ID sudah digunakan. Gunakan ID yang berbeda.', 'danger')
            return render_template('admin/form.html', site=None, action='add')
        
        # Parse koordinat
        lat, lng = parse_koordinat(request.form.get('koordinat'))
        
        # Tambahkan triple TempatIbadah
        g.add((site_uri, RDF.type, REL.TempatIbadah))
        
        nama = request.form.get('nama')
        
        # Tambahkan rdfs:label
        g.add((site_uri, RDFS.label, Literal(nama, lang='id')))
        
        # Tambahkan properties sesuai struktur TTL
        props = {
            'nama': (REL.nama, request.form.get('nama')),
            'alamat': (SCHEMA.address, request.form.get('alamat')),
            'wilayah': (REL.wilayah, request.form.get('wilayah')),
            'kecamatan': (REL.kecamatan, request.form.get('kecamatan')),
            'kode_pos': (REL.kodePos, request.form.get('kode_pos')),
            'tipe': (REL.tipeBangunan, request.form.get('tipe')),
            'agama': (REL.agama, request.form.get('agama')),
            'jam_buka': (REL.jamOperasional, request.form.get('jam_buka')),
            'kapasitas': (REL.kapasitas, request.form.get('kapasitas'), XSD.integer),
            'luas': (REL.luasLahan, request.form.get('luas')),
            'arsitek': (REL.arsitek, request.form.get('arsitek')),
            'tahun_berdiri': (REL.tahunBerdiri, request.form.get('tahun_berdiri'), XSD.gYear),
            'is_heritage': (REL.statusCagarBudaya, '1' if request.form.get('is_heritage') else '0', XSD.boolean),
            'heritage_code': (REL.kodeCagarBudaya, request.form.get('heritage_code')),
            'gambar_url': (SCHEMA.image, request.form.get('gambar_url')),
            'deskripsi': (SCHEMA.description, request.form.get('deskripsi'), 'id')
        }
        
        for key, prop_data in props.items():
            value = prop_data[1]
            if value:
                predicate = prop_data[0]
                
                if key == 'deskripsi':
                    g.add((site_uri, predicate, Literal(value, lang='id')))
                elif len(prop_data) > 2 and prop_data[2]:
                    g.add((site_uri, predicate, Literal(value, datatype=prop_data[2])))
                else:
                    g.add((site_uri, predicate, Literal(value)))
        
        # Tambahkan koordinat
        if lat and lng:
            g.add((site_uri, GEO.lat, Literal(lat, datatype=XSD.decimal)))
            g.add((site_uri, GEO.long, Literal(lng, datatype=XSD.decimal)))
        
        # Transport terdekat (bisa multiple)
        transport = request.form.get('transport_terdekat')
        if transport:
            for t in transport.split(','):
                t = t.strip()
                if t:
                    g.add((site_uri, REL.transportTerdekat, Literal(t)))
        
        # Simpan graph
        if save_graph():
            flash('Tempat ibadah berhasil ditambahkan!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Gagal menyimpan data.', 'danger')
    
    return render_template('admin/form.html', site=None, action='add')

@app.route('/admin/edit/<site_id>', methods=['GET', 'POST'])
@login_required
def admin_edit(site_id):
    site_uri = REL[site_id]
    
    # Cek apakah site exist
    if (site_uri, RDF.type, REL.TempatIbadah) not in g:
        flash('Tempat ibadah tidak ditemukan.', 'danger')
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        # Hapus semua triple lama kecuali RDF.type
        for pred, obj in list(g.predicate_objects(site_uri)):
            if pred != RDF.type:
                g.remove((site_uri, pred, obj))
        
        # Parse koordinat
        lat, lng = parse_koordinat(request.form.get('koordinat'))
        
        nama = request.form.get('nama')
        
        # Tambahkan rdfs:label
        g.add((site_uri, RDFS.label, Literal(nama, lang='id')))
        
        # Tambahkan properties baru sesuai struktur TTL
        props = {
            'nama': (REL.nama, request.form.get('nama')),
            'alamat': (SCHEMA.address, request.form.get('alamat')),
            'wilayah': (REL.wilayah, request.form.get('wilayah')),
            'kecamatan': (REL.kecamatan, request.form.get('kecamatan')),
            'kode_pos': (REL.kodePos, request.form.get('kode_pos')),
            'tipe': (REL.tipeBangunan, request.form.get('tipe')),
            'agama': (REL.agama, request.form.get('agama')),
            'jam_buka': (REL.jamOperasional, request.form.get('jam_buka')),
            'kapasitas': (REL.kapasitas, request.form.get('kapasitas'), XSD.integer),
            'luas': (REL.luasLahan, request.form.get('luas')),
            'arsitek': (REL.arsitek, request.form.get('arsitek')),
            'tahun_berdiri': (REL.tahunBerdiri, request.form.get('tahun_berdiri'), XSD.gYear),
            'is_heritage': (REL.statusCagarBudaya, '1' if request.form.get('is_heritage') else '0', XSD.boolean),
            'heritage_code': (REL.kodeCagarBudaya, request.form.get('heritage_code')),
            'gambar_url': (SCHEMA.image, request.form.get('gambar_url')),
            'deskripsi': (SCHEMA.description, request.form.get('deskripsi'), 'id')
        }
        
        for key, prop_data in props.items():
            value = prop_data[1]
            if value:
                predicate = prop_data[0]
                
                if key == 'deskripsi':
                    g.add((site_uri, predicate, Literal(value, lang='id')))
                elif len(prop_data) > 2 and prop_data[2]:
                    g.add((site_uri, predicate, Literal(value, datatype=prop_data[2])))
                else:
                    g.add((site_uri, predicate, Literal(value)))
        
        # Tambahkan koordinat
        if lat and lng:
            g.add((site_uri, GEO.lat, Literal(lat, datatype=XSD.decimal)))
            g.add((site_uri, GEO.long, Literal(lng, datatype=XSD.decimal)))
        
        # Transport terdekat (bisa multiple)
        transport = request.form.get('transport_terdekat')
        if transport:
            for t in transport.split(','):
                t = t.strip()
                if t:
                    g.add((site_uri, REL.transportTerdekat, Literal(t)))
        
        # Simpan graph
        if save_graph():
            flash('Tempat ibadah berhasil diperbarui!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Gagal menyimpan data.', 'danger')
    
    site = get_site_from_graph(site_id)
    return render_template('admin/form.html', site=site, action='edit')

@app.route('/admin/delete/<site_id>', methods=['POST'])
@login_required
def admin_delete(site_id):
    site_uri = REL[site_id]
    
    # Hapus semua triple terkait site ini
    for pred, obj in list(g.predicate_objects(site_uri)):
        g.remove((site_uri, pred, obj))
    
    # Simpan graph
    if save_graph():
        flash('Tempat ibadah berhasil dihapus!', 'success')
    else:
        flash('Gagal menghapus data.', 'danger')
    
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

# --- API ENDPOINTS (dari TTL Graph) ---
@app.route('/api/sites', methods=['GET'])
def get_all_sites():
    sites = get_all_sites_from_graph()
    
    result = []
    for site in sites:
        result.append({
            'id': site.get('id'),
            'nama': site.get('nama'),
            'alamat': site.get('alamat'),
            'wilayah': site.get('wilayah'),
            'kecamatan': site.get('kecamatan'),
            'kode_pos': site.get('kode_pos'),
            'tipe': site.get('tipe'),
            'agama': site.get('agama'),
            'jam_buka': site.get('jam_buka'),
            'kapasitas': site.get('kapasitas'),
            'luas': site.get('luas'),
            'arsitek': site.get('arsitek'),
            'tahun': site.get('tahun_berdiri'),
            'is_heritage': site.get('is_heritage', False),
            'heritage_code': site.get('heritage_code'),
            'transport_terdekat': site.get('transport_terdekat'),
            'latitude': site.get('latitude'),
            'longitude': site.get('longitude'),
            'gambar_url': site.get('gambar_url'),
            'deskripsi': site.get('deskripsi')
        })
    
    return jsonify(result)

@app.route('/api/site/<site_id>', methods=['GET'])
def get_site(site_id):
    site = get_site_from_graph(site_id)
    
    if not site:
        return jsonify({'error': 'Site not found'}), 404
    
    return jsonify({
        'id': site.get('id'),
        'nama': site.get('nama'),
        'alamat': site.get('alamat'),
        'wilayah': site.get('wilayah'),
        'kecamatan': site.get('kecamatan'),
        'kode_pos': site.get('kode_pos'),
        'tipe': site.get('tipe'),
        'agama': site.get('agama'),
        'jam_buka': site.get('jam_buka'),
        'kapasitas': site.get('kapasitas'),
        'luas': site.get('luas'),
        'arsitek': site.get('arsitek'),
        'tahun_berdiri': site.get('tahun_berdiri'),
        'is_heritage': site.get('is_heritage', False),
        'heritage_code': site.get('heritage_code'),
        'transport_terdekat': site.get('transport_terdekat'),
        'latitude': site.get('latitude'),
        'longitude': site.get('longitude'),
        'gambar_url': site.get('gambar_url'),
        'deskripsi': site.get('deskripsi')
    })

@app.route('/api/locations', methods=['GET'])
def get_locations():
    wilayah_set = set()
    for site in get_all_sites_from_graph():
        if site.get('wilayah'):
            wilayah_set.add(site['wilayah'])
    return jsonify(sorted(list(wilayah_set)))

@app.route('/api/religions', methods=['GET'])
def get_religions():
    agama_set = set()
    for site in get_all_sites_from_graph():
        if site.get('agama'):
            agama_set.add(site['agama'])
    return jsonify(sorted(list(agama_set)))

@app.route('/api/stats', methods=['GET'])
def get_stats():
    sites = get_all_sites_from_graph()
    total_sites = len(sites)
    total_heritage = sum(1 for site in sites if site.get('is_heritage'))
    return jsonify({
        'total_sites': total_sites,
        'total_heritage': total_heritage
    })

# --- RELIGIOUS CALENDAR API ---
def get_indonesian_holidays(year):
    """Get Indonesian religious holidays (manual data from official calendar)"""
    # Manual data for 2026-2027 based on official Indonesian calendar
    manual_events = {
        2026: [
            # Islamic
            {'date': '2026-01-27', 'title': 'Isra Mi\'raj 1447 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2026-02-18', 'title': 'Awal Ramadan 1447 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2026-03-19', 'title': 'Idul Fitri 1447 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2026-03-20', 'title': 'Idul Fitri 1447 H (Hari ke-2)', 'location': 'Masjid Agung Al-Azhar', 'agama': 'Islam'},
            {'date': '2026-06-06', 'title': 'Idul Adha 1447 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2026-06-26', 'title': 'Tahun Baru Islam 1448 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2026-09-04', 'title': 'Maulid Nabi Muhammad SAW', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            
            # Christian
            {'date': '2026-04-03', 'title': 'Jumat Agung', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2026-04-05', 'title': 'Paskah', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2026-05-14', 'title': 'Kenaikan Isa Almasih', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2026-12-24', 'title': 'Misa Malam Natal', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2026-12-25', 'title': 'Perayaan Natal', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            
            # Buddhist
            {'date': '2026-05-12', 'title': 'Hari Raya Waisak 2570 BE', 'location': 'Vihara Sin Tek Bio', 'agama': 'Buddha'},
            
            # Hindu
            {'date': '2026-03-22', 'title': 'Hari Raya Nyepi', 'location': 'Pura Aditya Jaya', 'agama': 'Hindu'},
            {'date': '2026-07-08', 'title': 'Hari Raya Galungan', 'location': 'Pura Aditya Jaya', 'agama': 'Hindu'},
            {'date': '2026-07-18', 'title': 'Hari Raya Kuningan', 'location': 'Pura Aditya Jaya', 'agama': 'Hindu'},
            
            # Chinese/Confucian
            {'date': '2026-02-17', 'title': 'Tahun Baru Imlek 2577', 'location': 'Vihara Sin Tek Bio', 'agama': 'Konghucu'},
            {'date': '2026-03-03', 'title': 'Cap Go Meh', 'location': 'Vihara Sin Tek Bio', 'agama': 'Konghucu'},
        ],
        2027: [
            # Islamic
            {'date': '2027-01-16', 'title': 'Isra Mi\'raj 1448 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2027-02-17', 'title': 'Awal Ramadan 1448 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2027-03-19', 'title': 'Idul Fitri 1448 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2027-03-20', 'title': 'Idul Fitri 1448 H (Hari ke-2)', 'location': 'Masjid Agung Al-Azhar', 'agama': 'Islam'},
            {'date': '2027-05-26', 'title': 'Idul Adha 1448 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2027-06-15', 'title': 'Tahun Baru Islam 1449 H', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            {'date': '2027-08-24', 'title': 'Maulid Nabi Muhammad SAW', 'location': 'Masjid Istiqlal', 'agama': 'Islam'},
            
            # Christian
            {'date': '2027-03-26', 'title': 'Jumat Agung', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2027-03-28', 'title': 'Paskah', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2027-04-08', 'title': 'Kenaikan Isa Almasih', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2027-12-24', 'title': 'Misa Malam Natal', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            {'date': '2027-12-25', 'title': 'Perayaan Natal', 'location': 'Gereja Katedral Jakarta', 'agama': 'Katolik'},
            
            # Buddhist
            {'date': '2027-05-01', 'title': 'Hari Raya Waisak 2571 BE', 'location': 'Vihara Sin Tek Bio', 'agama': 'Buddha'},
            
            # Hindu
            {'date': '2027-03-11', 'title': 'Hari Raya Nyepi', 'location': 'Pura Aditya Jaya', 'agama': 'Hindu'},
            {'date': '2027-06-26', 'title': 'Hari Raya Galungan', 'location': 'Pura Aditya Jaya', 'agama': 'Hindu'},
            {'date': '2027-07-06', 'title': 'Hari Raya Kuningan', 'location': 'Pura Aditya Jaya', 'agama': 'Hindu'},
            
            # Chinese/Confucian
            {'date': '2027-01-17', 'title': 'Tahun Baru Imlek 2578', 'location': 'Vihara Sin Tek Bio', 'agama': 'Konghucu'},
            {'date': '2027-02-28', 'title': 'Cap Go Meh', 'location': 'Vihara Sin Tek Bio', 'agama': 'Konghucu'},
        ]
    }
    
    return manual_events.get(year, [])

@app.route('/api/calendar/<int:year>', methods=['GET'])
def get_calendar_events(year):
    """API endpoint untuk mendapatkan kalender religi"""
    try:
        # Get data manual dari function
        events = get_indonesian_holidays(year)
        
        # Optional: Jika punya API key Calendarific, bisa fetch dari sana
        # Requires 'requests' package (currently commented out in imports)
        # if CALENDARIFIC_API_KEY:
        #     try:
        #         import requests
        #         response = requests.get(CALENDARIFIC_URL, params={
        #             'api_key': CALENDARIFIC_API_KEY,
        #             'country': 'ID',
        #             'year': year,
        #             'type': 'national,religious'
        #         }, timeout=5)
        #         
        #         if response.status_code == 200:
        #             api_data = response.json()
        #             # Merge dengan data manual (prioritas data manual)
        #             print(f"✅ Fetched {len(api_data.get('response', {}).get('holidays', []))} holidays from Calendarific")
        #     except Exception as e:
        #         print(f"⚠️ Calendarific API error: {e}")
        
        return jsonify({
            'success': True,
            'year': year,
            'events': events,
            'total': len(events)
        })
    
    except Exception as e:
        print(f"❌ Calendar API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("="*60)
    print("🚀 Jakarta Semantic Harmony - Pure TTL System (Development)")
    print(f"📊 Total triples: {len(g)}")
    print(f"🏛️  Total sites: {len(get_all_sites_from_graph())}")
    print("⚠️  Development server on port 1083 (production uses 1081)")
    print("="*60)
    app.run(debug=True, port=1083)
