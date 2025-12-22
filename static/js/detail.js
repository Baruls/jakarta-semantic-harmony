// ===== DETAIL PAGE =====

// Events by religion
const eventsByReligion = {
    'Islam': ['Shalat Idul Fitri Kenegaraan', 'Pengajian Akbar Bulanan', 'Shalat Idul Adha Kenegaraan'],
    'Katolik': ['Misa Natal', 'Misa Paskah', 'Misa Tahun Baru'],
    'KristenProtestan': ['Kebaktian Natal', 'Kebaktian Paskah', 'Perayaan Hari Reformasi'],
    'Buddha': ['Perayaan Waisak', 'Meditasi Bulanan', 'Kathina'],
    'Hindu': ['Perayaan Nyepi', 'Galungan', 'Kuningan'],
    'Konghucu': ['Imlek', 'Cap Go Meh', 'Sembahyang Leluhur']
};

document.addEventListener('DOMContentLoaded', function() {
    loadSiteDetail();
});

async function loadSiteDetail() {
    try {
        const response = await fetch(`/api/site/${siteId}`);
        
        if (!response.ok) {
            throw new Error('Site not found');
        }
        
        const site = await response.json();
        displaySiteDetail(site);
    } catch (error) {
        console.error('Error loading site detail:', error);
        document.getElementById('siteName').textContent = 'Data Tidak Ditemukan';
    }
}

function displaySiteDetail(site) {
    // Update hero - use gambar_url from database
    const heroImage = site.gambar_url || 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200';
    const detailHero = document.getElementById('detailHero');
    detailHero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${heroImage}')`;
    
    // Update title
    document.getElementById('siteName').textContent = site.nama;
    
    // Update info
    const fullAddress = formatFullAddress(site);
    document.getElementById('siteAddress').textContent = fullAddress;
    document.getElementById('siteHours').textContent = site.jam_buka || '-';
    document.getElementById('siteCapacity').textContent = formatNumber(site.kapasitas);
    document.getElementById('siteArea').textContent = site.luas || '-';
    document.getElementById('siteArchitect').textContent = site.arsitek || '-';
    document.getElementById('siteYear').textContent = site.tahun_berdiri || '-';
    
    // Show/hide optional fields
    if (site.arsitek === '-') {
        document.getElementById('architectRow').style.display = 'none';
    }
    if (site.tahun_berdiri === '-') {
        document.getElementById('yearRow').style.display = 'none';
    }
    
    // Update transport
    updateTransportCards(site.transport_terdekat);
    
    // Update events based on religion
    updateEventTags(site.agama);
    
    // Update description
    document.getElementById('siteDescription').textContent = getDescription(site);
}

function formatFullAddress(site) {
    let parts = [site.alamat];
    
    if (site.kecamatan && site.kecamatan !== '-') {
        parts.push(formatLocationName(site.kecamatan));
    }
    
    if (site.wilayah && site.wilayah !== '-') {
        parts.push(formatLocationName(site.wilayah));
    }
    
    if (site.kode_pos && site.kode_pos !== '-') {
        parts.push('DKI Jakarta ' + site.kode_pos);
    }
    
    return parts.join(', ');
}

function formatNumber(num) {
    if (!num || num === '-') return '-';
    return parseInt(num).toLocaleString('id-ID');
}

function formatLocationName(location) {
    return location.replace(/([A-Z])/g, ' $1').trim();
}

function updateTransportCards(transport) {
    const container = document.getElementById('transportCards');
    
    if (!transport || transport === 'Tidak ada data') {
        container.innerHTML = '<p style="color: #6c757d;">Tidak ada data transportasi</p>';
        return;
    }
    
    // Split transportasi yang dipisahkan oleh "; "
    const transports = transport.split(';').map(t => t.trim()).filter(t => t);
    
    container.innerHTML = transports.map(t => {
        // Determine transport type per item
        let icon = 'fa-bus';
        
        if (t.toLowerCase().includes('stasiun') || t.toLowerCase().includes('krl') || t.toLowerCase().includes('mrt')) {
            icon = 'fa-train';
        } else if (t.toLowerCase().includes('halte')) {
            icon = 'fa-bus-alt';
        }
        
        return `
            <div class="transport-card">
                <i class="fas ${icon}"></i>
                <div>
                    <span>${t}</span>
                    <small>Jarak ± 500m</small>
                </div>
            </div>
        `;
    }).join('');
}

function updateEventTags(religion) {
    const container = document.getElementById('eventTags');
    const events = eventsByReligion[religion] || ['Tidak ada data acara'];
    
    container.innerHTML = events.map(event => `
        <span class="event-tag">${event}</span>
    `).join('');
}

function getDescription(site) {
    // Use deskripsi from database if available
    if (site.deskripsi && site.deskripsi !== '-') {
        return site.deskripsi;
    }
    
    return 'Tidak ada deskripsi yang tersedia untuk tempat ibadah ini.';
}
