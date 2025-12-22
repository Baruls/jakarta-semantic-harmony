// ===== NAVBAR TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
});

// ===== UTILITY FUNCTIONS =====
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

function formatLocationName(location) {
    // Convert "JakartaPusat" to "Jakarta Pusat"
    return location.replace(/([A-Z])/g, ' $1').trim();
}

function getPlaceImage(type, name) {
    const images = {
        'Mosque': 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400',
        'Church': 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400',
        'Vihara': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
        'Temple': 'https://images.unsplash.com/photo-1600100231128-f5c5b07fa67a?w=400'
    };
    
    // Specific images for known places
    const specificImages = {
        'MasjidIstiqlal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Istiqlal_Mosque_Texture.jpg/800px-Istiqlal_Mosque_Texture.jpg',
        'GerejaKatedral': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jakarta_Cathedral_%282%29.jpg/800px-Jakarta_Cathedral_%282%29.jpg'
    };
    
    return specificImages[name] || images[type] || images['Mosque'];
}
