// ===== MAP INITIALIZATION =====
let map;
let markers = [];
let allSites = [];

// Icon colors by religion
const religionColors = {
    'Islam': '#2ecc71',
    'Katolik': '#e74c3c',
    'KristenProtestan': '#3498db',
    'Buddha': '#f39c12',
    'Hindu': '#9b59b6',
    'Konghucu': '#e67e22'
};

// Icon by type of place
const placeIcons = {
    'Mosque': 'fa-mosque',
    'Church': 'fa-church',
    'Vihara': 'fa-vihara',
    'Temple': 'fa-om'
};

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadSites();
    loadStats();
    loadLocations();
    setupFilters();
});

function initMap() {
    // Initialize map centered on Jakarta
    map = L.map('map').setView([-6.2088, 106.8456], 11);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

async function loadSites() {
    try {
        const response = await fetch('/api/sites');
        allSites = await response.json();
        updateMarkers(allSites);
    } catch (error) {
        console.error('Error loading sites:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('totalSites').textContent = stats.total_sites || 0;
        document.getElementById('totalHeritage').textContent = stats.total_heritage || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadLocations() {
    try {
        const response = await fetch('/api/locations');
        const locations = await response.json();
        
        const wilayahFilter = document.getElementById('wilayahFilter');
        locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc;
            option.textContent = formatLocationName(loc);
            wilayahFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

function updateMarkers(sites) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    sites.forEach(site => {
        // Koordinat diambil dari database (API response)
        if (site.latitude && site.longitude) {
            const coords = [site.latitude, site.longitude];
            
            // Create custom icon based on type
            const color = religionColors[site.agama] || '#1a3a5c';
            const iconClass = placeIcons[site.tipe] || 'fa-place-of-worship';
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${iconClass}" style="color: white; font-size: 14px;"></i>
                </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
            
            const marker = L.marker(coords, { icon: icon }).addTo(map);
            
            // Google Maps URL
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
            
            // Gambar diambil dari database
            const imageUrl = site.gambar_url || 'https://via.placeholder.com/400x200?text=No+Image';
            
            // Create popup content with location info
            const popupContent = `
                <div style="min-width: 220px; padding: 10px;">
                    <img src="${imageUrl}" 
                         style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;"
                         onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                    <h4 style="margin: 0 0 5px; font-size: 14px; font-weight: 600;">${site.nama}</h4>
                    <p style="margin: 0 0 8px; font-size: 11px; color: #666;">
                        <i class="fas fa-map-marker-alt" style="color: ${color};"></i> ${formatLocationName(site.wilayah)}
                    </p>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
                        <span style="background: ${color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">
                            <i class="fas ${iconClass}"></i> ${formatReligionName(site.agama)}
                        </span>
                        ${site.tahun ? `<span style="background: #6c757d; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;"><i class="fas fa-calendar"></i> ${site.tahun}</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <a href="/detail/${site.id}" style="flex: 1; text-align: center; padding: 8px; background: #1a3a5c; color: white; border-radius: 5px; font-size: 11px; text-decoration: none;">
                            <i class="fas fa-info-circle"></i> Detail
                        </a>
                        <a href="${googleMapsUrl}" target="_blank" style="flex: 1; text-align: center; padding: 8px; background: #4285F4; color: white; border-radius: 5px; font-size: 11px; text-decoration: none;">
                            <i class="fas fa-map-marked-alt"></i> Google Maps
                        </a>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        }
    });
}

function setupFilters() {
    // Religion filter checkboxes
    const agamaCheckboxes = document.querySelectorAll('input[name="agama"]');
    agamaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Heritage only checkbox
    const heritageOnly = document.getElementById('heritageOnly');
    if (heritageOnly) {
        heritageOnly.addEventListener('change', applyFilters);
    }
    
    // Wilayah filter
    const wilayahFilter = document.getElementById('wilayahFilter');
    if (wilayahFilter) {
        wilayahFilter.addEventListener('change', applyFilters);
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    let filteredSites = [...allSites];
    
    // Apply religion filter
    const selectedReligions = [];
    document.querySelectorAll('input[name="agama"]:checked').forEach(cb => {
        selectedReligions.push(cb.value);
    });
    
    if (selectedReligions.length > 0) {
        filteredSites = filteredSites.filter(site => selectedReligions.includes(site.agama));
    }
    
    // Apply heritage filter
    const heritageOnly = document.getElementById('heritageOnly');
    if (heritageOnly && heritageOnly.checked) {
        filteredSites = filteredSites.filter(site => site.is_heritage);
    }
    
    // Apply wilayah filter
    const wilayahFilter = document.getElementById('wilayahFilter');
    if (wilayahFilter && wilayahFilter.value) {
        filteredSites = filteredSites.filter(site => site.wilayah === wilayahFilter.value);
    }
    
    // Apply sort
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter && sortFilter.value) {
        if (sortFilter.value === 'nama') {
            filteredSites.sort((a, b) => a.nama.localeCompare(b.nama));
        } else if (sortFilter.value === 'tahun') {
            filteredSites.sort((a, b) => (a.tahun || 9999) - (b.tahun || 9999));
        }
    }
    
    updateMarkers(filteredSites);
}
