// ===== JELAJAHI PAGE =====
let allSites = [];
let currentPage = 1;
const itemsPerPage = 8;

document.addEventListener('DOMContentLoaded', function() {
    loadSites();
    loadLocations();
    setupFilters();
});

async function loadSites() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/sites');
        allSites = await response.json();
        displaySites(allSites);
    } catch (error) {
        console.error('Error loading sites:', error);
        showEmpty(true);
    } finally {
        showLoading(false);
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

function setupFilters() {
    const jenisFilter = document.getElementById('jenisFilter');
    const wilayahFilter = document.getElementById('wilayahFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    jenisFilter.addEventListener('change', applyFilters);
    wilayahFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

function applyFilters() {
    let filteredSites = [...allSites];
    
    const jenisFilter = document.getElementById('jenisFilter').value;
    const wilayahFilter = document.getElementById('wilayahFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    if (jenisFilter) {
        filteredSites = filteredSites.filter(site => site.tipe === jenisFilter);
    }
    
    if (wilayahFilter) {
        filteredSites = filteredSites.filter(site => site.wilayah === wilayahFilter);
    }
    
    if (searchQuery) {
        filteredSites = filteredSites.filter(site => 
            site.nama.toLowerCase().includes(searchQuery) ||
            site.alamat.toLowerCase().includes(searchQuery) ||
            site.wilayah.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply sorting
    if (sortFilter) {
        filteredSites = sortSites(filteredSites, sortFilter);
    }
    
    currentPage = 1;
    displaySites(filteredSites);
}

function sortSites(sites, sortType) {
    const sorted = [...sites];
    
    switch(sortType) {
        case 'nama-asc':
            sorted.sort((a, b) => a.nama.localeCompare(b.nama));
            break;
        case 'nama-desc':
            sorted.sort((a, b) => b.nama.localeCompare(a.nama));
            break;
        case 'tahun-asc':
            sorted.sort((a, b) => {
                const yearA = a.tahun ? parseInt(a.tahun) : 9999;
                const yearB = b.tahun ? parseInt(b.tahun) : 9999;
                return yearA - yearB;
            });
            break;
        case 'tahun-desc':
            sorted.sort((a, b) => {
                const yearA = a.tahun ? parseInt(a.tahun) : 0;
                const yearB = b.tahun ? parseInt(b.tahun) : 0;
                return yearB - yearA;
            });
            break;
        case 'agama':
            sorted.sort((a, b) => (a.agama || '').localeCompare(b.agama || ''));
            break;
        case 'wilayah':
            sorted.sort((a, b) => (a.wilayah || '').localeCompare(b.wilayah || ''));
            break;
    }
    
    return sorted;
}

function displaySites(sites) {
    const grid = document.getElementById('sitesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (sites.length === 0) {
        showEmpty(true);
        grid.innerHTML = '';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    showEmpty(false);
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSites = sites.slice(startIndex, endIndex);
    
    grid.innerHTML = paginatedSites.map(site => createSiteCard(site)).join('');
    
    // Generate pagination
    generatePagination(sites.length);
}

function createSiteCard(site) {
    const image = site.gambar_url || getDefaultImage(site.tipe);
    const color = getReligionColor(site.agama);
    const iconClass = getPlaceIcon(site.tipe);
    
    return `
        <div class="site-card">
            <div class="site-card-image" style="background-image: url('${image}')">
                <span class="site-card-badge" style="background: ${color};">
                    <i class="fas ${iconClass}"></i>
                </span>
            </div>
            <div class="site-card-body">
                <h4 class="site-card-title">${site.nama}</h4>
                <p class="site-card-location">
                    <i class="fas fa-map-marker-alt"></i> ${formatLocationName(site.wilayah)}
                </p>
                <div class="site-card-tags">
                    <span class="site-tag" style="background: ${color}; color: white;">
                        <i class="fas ${iconClass}"></i> ${formatReligionName(site.agama)}
                    </span>
                    ${site.tahun ? `<span class="site-tag heritage"><i class="fas fa-calendar"></i> Est. ${site.tahun}</span>` : ''}
                </div>
                <a href="/detail/${site.id}" class="site-card-btn">Lihat Detail</a>
            </div>
        </div>
    `;
}

function getReligionColor(agama) {
    const colors = {
        'Islam': '#2ecc71',
        'Katolik': '#e74c3c',
        'KristenProtestan': '#3498db',
        'Buddha': '#f39c12',
        'Hindu': '#9b59b6',
        'Konghucu': '#e67e22'
    };
    return colors[agama] || '#1a3a5c';
}

function getPlaceIcon(tipe) {
    const icons = {
        'Mosque': 'fa-mosque',
        'Church': 'fa-church',
        'Vihara': 'fa-vihara',
        'Temple': 'fa-om'
    };
    return icons[tipe] || 'fa-place-of-worship';
}

function getDefaultImage(type) {
    const defaults = {
        'Mosque': 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400',
        'Church': 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400',
        'Vihara': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
        'Temple': 'https://images.unsplash.com/photo-1600100231128-f5c5b07fa67a?w=400'
    };
    return defaults[type] || defaults['Mosque'];
}

function generatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<span class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</span>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span>...</span>`;
        }
    }
    
    html += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    const filteredSites = getFilteredSites();
    const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displaySites(filteredSites);
    
    // Scroll to top of grid
    document.querySelector('.sites-section').scrollIntoView({ behavior: 'smooth' });
}

function getFilteredSites() {
    let filteredSites = [...allSites];
    
    const jenisFilter = document.getElementById('jenisFilter').value;
    const wilayahFilter = document.getElementById('wilayahFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    if (jenisFilter) {
        filteredSites = filteredSites.filter(site => site.tipe === jenisFilter);
    }
    
    if (wilayahFilter) {
        filteredSites = filteredSites.filter(site => site.wilayah === wilayahFilter);
    }
    
    if (searchQuery) {
        filteredSites = filteredSites.filter(site => 
            site.nama.toLowerCase().includes(searchQuery) ||
            site.alamat.toLowerCase().includes(searchQuery)
        );
    }
    
    return filteredSites;
}

function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const grid = document.getElementById('sitesGrid');
    
    if (show) {
        loadingState.style.display = 'block';
        grid.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        grid.style.display = 'grid';
    }
}

function showEmpty(show) {
    const emptyState = document.getElementById('emptyState');
    emptyState.style.display = show ? 'block' : 'none';
}

function formatLocationName(location) {
    return location.replace(/([A-Z])/g, ' $1').trim();
}

function formatReligionName(religion) {
    const names = {
        'Islam': 'Islam',
        'Katolik': 'Kristen Katolik',
        'KristenProtestan': 'Kristen Protestan',
        'Buddha': 'Buddha',
        'Hindu': 'Hindu',
        'Konghucu': 'Konghucu'
    };
    return names[religion] || religion;
}
