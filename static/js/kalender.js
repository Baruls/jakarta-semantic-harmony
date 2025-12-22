// ===== KALENDER PAGE =====

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Color and icon mapping by religion
const religionStyle = {
    'Islam': { color: '#2ecc71', icon: 'fa-mosque' },
    'Katolik': { color: '#e74c3c', icon: 'fa-church' },
    'KristenProtestan': { color: '#3498db', icon: 'fa-church' },
    'Buddha': { color: '#f39c12', icon: 'fa-vihara' },
    'Hindu': { color: '#9b59b6', icon: 'fa-om' },
    'Konghucu': { color: '#e67e22', icon: 'fa-vihara' }
};

// Events with religion info
const events = [
    // Januari 2025
    { date: '2025-01-01', title: 'Shalat Tahun Baru', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2025-01-29', title: 'Tahun Baru Imlek 2576', location: 'Vihara Sin Tek Bio', agama: 'Konghucu' },
    
    // Februari 2025
    { date: '2025-02-12', title: 'Isra Mi\'raj', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2025-02-15', title: 'Cap Go Meh', location: 'Vihara Sin Tek Bio', agama: 'Konghucu' },
    
    // Maret 2025
    { date: '2025-03-01', title: 'Awal Ramadan 1446 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2025-03-29', title: 'Hari Raya Nyepi', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    { date: '2025-03-30', title: 'Idul Fitri 1446 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2025-03-31', title: 'Idul Fitri 1446 H (Hari ke-2)', location: 'Masjid Agung Al-Azhar', agama: 'Islam' },
    
    // April 2025
    { date: '2025-04-18', title: 'Jumat Agung', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2025-04-18', title: 'Jumat Agung', location: 'Gereja Sion', agama: 'KristenProtestan' },
    { date: '2025-04-20', title: 'Paskah', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2025-04-20', title: 'Paskah', location: 'Gereja Sion', agama: 'KristenProtestan' },
    
    // Mei 2025
    { date: '2025-05-12', title: 'Hari Raya Waisak 2569 BE', location: 'Vihara Sin Tek Bio', agama: 'Buddha' },
    { date: '2025-05-29', title: 'Kenaikan Isa Almasih', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    
    // Juni 2025
    { date: '2025-06-06', title: 'Idul Adha 1446 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2025-06-07', title: 'Idul Adha 1446 H', location: 'Masjid Agung Al-Azhar', agama: 'Islam' },
    { date: '2025-06-27', title: 'Tahun Baru Islam 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    
    // Juli 2025
    { date: '2025-07-06', title: 'Hari Raya Galungan', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    { date: '2025-07-16', title: 'Hari Raya Kuningan', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    
    // Agustus 2025
    { date: '2025-08-17', title: 'Misa HUT RI ke-80', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2025-08-17', title: 'Shalat Syukur HUT RI', location: 'Masjid Istiqlal', agama: 'Islam' },
    
    // September 2025
    { date: '2025-09-05', title: 'Maulid Nabi Muhammad SAW', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2025-09-05', title: 'Maulid Nabi Muhammad SAW', location: 'Masjid Agung Al-Azhar', agama: 'Islam' },
    
    // Oktober 2025
    { date: '2025-10-20', title: 'Hari Raya Saraswati', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    
    // November 2025
    { date: '2025-11-01', title: 'Hari Raya Semua Orang Kudus', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2025-11-02', title: 'Hari Arwah', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    
    // Desember 2025
    { date: '2025-12-24', title: 'Misa Malam Natal', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2025-12-24', title: 'Ibadah Malam Natal', location: 'Gereja Sion', agama: 'KristenProtestan' },
    { date: '2025-12-25', title: 'Perayaan Natal', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2025-12-25', title: 'Perayaan Natal', location: 'Gereja Sion', agama: 'KristenProtestan' },
    { date: '2025-12-31', title: 'Misa Tahun Baru', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    
    // Januari 2026
    { date: '2026-01-01', title: 'Shalat Tahun Baru', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-01-17', title: 'Tahun Baru Imlek 2577', location: 'Vihara Sin Tek Bio', agama: 'Konghucu' },
    
    // Februari 2026
    { date: '2026-02-01', title: 'Cap Go Meh', location: 'Vihara Sin Tek Bio', agama: 'Konghucu' },
    { date: '2026-02-17', title: 'Isra Mi\'raj 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-02-19', title: 'Awal Ramadan 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    
    // Maret 2026
    { date: '2026-03-17', title: 'Hari Raya Nyepi', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    { date: '2026-03-20', title: 'Idul Fitri 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-03-21', title: 'Idul Fitri 1447 H (Hari ke-2)', location: 'Masjid Agung Al-Azhar', agama: 'Islam' },
    
    // April 2026
    { date: '2026-04-03', title: 'Jumat Agung', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-04-03', title: 'Jumat Agung', location: 'Gereja Sion', agama: 'KristenProtestan' },
    { date: '2026-04-05', title: 'Paskah', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-04-05', title: 'Paskah', location: 'Gereja Sion', agama: 'KristenProtestan' },
    
    // Mei 2026
    { date: '2026-05-01', title: 'Hari Raya Waisak 2570 BE', location: 'Vihara Sin Tek Bio', agama: 'Buddha' },
    { date: '2026-05-14', title: 'Kenaikan Isa Almasih', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-05-27', title: 'Idul Adha 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    
    // Juni 2026
    { date: '2026-06-16', title: 'Tahun Baru Islam 1448 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-06-25', title: 'Hari Raya Galungan', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    
    // Juli 2026
    { date: '2026-07-05', title: 'Hari Raya Kuningan', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    
    // Agustus 2026
    { date: '2026-08-17', title: 'Misa HUT RI ke-81', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-08-17', title: 'Shalat Syukur HUT RI', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-08-25', title: 'Maulid Nabi Muhammad SAW', location: 'Masjid Istiqlal', agama: 'Islam' },
    
    // September 2026
    { date: '2026-09-10', title: 'Hari Raya Saraswati', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    
    // Oktober 2026
    { date: '2026-10-04', title: 'Hari Raya Galungan', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    { date: '2026-10-14', title: 'Hari Raya Kuningan', location: 'Pura Aditya Jaya', agama: 'Hindu' },
    
    // November 2026
    { date: '2026-11-01', title: 'Hari Raya Semua Orang Kudus', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-11-02', title: 'Hari Arwah', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    
    // Desember 2026
    { date: '2026-12-24', title: 'Misa Malam Natal', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-12-24', title: 'Ibadah Malam Natal', location: 'Gereja Sion', agama: 'KristenProtestan' },
    { date: '2026-12-25', title: 'Perayaan Natal', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-12-25', title: 'Perayaan Natal', location: 'Gereja Sion', agama: 'KristenProtestan' },
    { date: '2026-12-31', title: 'Misa Tahun Baru', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    
    // Januari 2027
    { date: '2027-01-01', title: 'Shalat Tahun Baru', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2027-01-06', title: 'Tahun Baru Imlek 2578', location: 'Vihara Sin Tek Bio', agama: 'Konghucu' }
];

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    setupNavigation();
    renderUpcomingEvents();
});

function renderCalendar() {
    const monthLabel = document.getElementById('currentMonth');
    monthLabel.textContent = `${months[currentMonth]} ${currentYear}`;
    
    const calendarGrid = document.querySelector('.calendar-grid');
    
    // Clear previous days (except headers)
    const existingDays = calendarGrid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days
    const today = new Date();
    
    for (let day = 1; day <= totalDays; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Check if today
        if (day === today.getDate() && 
            currentMonth === today.getMonth() && 
            currentYear === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        // Check if has event
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        
        if (dayEvents.length > 0) {
            dayEl.classList.add('has-event');
            
            // Add icons for each religion on this day
            const iconsContainer = document.createElement('div');
            iconsContainer.className = 'event-icons';
            
            // Get unique religions for this day (max 3 to fit)
            const uniqueReligions = [...new Set(dayEvents.map(e => e.agama))].slice(0, 3);
            uniqueReligions.forEach(agama => {
                const style = religionStyle[agama] || { color: '#1a3a5c', icon: 'fa-calendar' };
                const iconEl = document.createElement('i');
                iconEl.className = `fas ${style.icon} event-icon`;
                iconEl.style.color = style.color;
                iconEl.title = formatAgamaName(agama);
                iconsContainer.appendChild(iconEl);
            });
            
            dayEl.appendChild(iconsContainer);
            dayEl.addEventListener('click', () => showEventsForDate(dateStr));
        }
        
        calendarGrid.appendChild(dayEl);
    }
}

function formatAgamaName(agama) {
    const names = {
        'Islam': 'Islam',
        'Katolik': 'Katolik',
        'KristenProtestan': 'Kristen Protestan',
        'Buddha': 'Buddha',
        'Hindu': 'Hindu',
        'Konghucu': 'Konghucu'
    };
    return names[agama] || agama;
}

function setupNavigation() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    prevBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter upcoming events
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">Tidak ada acara mendatang</p>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => {
        const date = new Date(event.date);
        const day = date.getDate();
        const month = months[date.getMonth()].substring(0, 3).toUpperCase();
        const style = religionStyle[event.agama] || { color: '#1a3a5c', icon: 'fa-calendar' };
        
        return `
            <div class="event-card">
                <div class="event-date" style="background: ${style.color};">
                    <span class="day">${String(day).padStart(2, '0')}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="event-info">
                    <h4>
                        <i class="fas ${style.icon}" style="color: ${style.color}; margin-right: 5px;"></i>
                        ${event.title}
                    </h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                </div>
            </div>
        `;
    }).join('');
}

function showEventsForDate(dateStr) {
    const dayEvents = events.filter(e => e.date === dateStr);
    if (dayEvents.length === 0) return;
    
    const date = new Date(dateStr);
    const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    
    // Create modal content with styled events
    const modalContent = dayEvents.map(e => {
        const style = religionStyle[e.agama] || { color: '#1a3a5c', icon: 'fa-calendar' };
        return `<div style="padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${style.color};">
            <strong><i class="fas ${style.icon}" style="color: ${style.color};"></i> ${e.title}</strong><br>
            <small style="color: #666;"><i class="fas fa-map-marker-alt"></i> ${e.location}</small>
        </div>`;
    }).join('');
    
    // Show in a better modal
    showEventModal(formattedDate, modalContent);
}

function showEventModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.event-modal-overlay');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div class="event-modal-overlay" onclick="this.remove()">
            <div class="event-modal" onclick="event.stopPropagation()">
                <div class="event-modal-header">
                    <h3><i class="fas fa-calendar-day"></i> ${title}</h3>
                    <button class="close-modal" onclick="document.querySelector('.event-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="event-modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
