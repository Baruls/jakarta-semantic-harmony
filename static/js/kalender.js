// ===== KALENDER PAGE - API-BASED VERSION =====

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

// Events - loaded dynamically from backend API
let events = [];
let eventsCache = {}; // Cache untuk mengurangi API calls

// Fallback data jika API gagal (minimal events)
const fallbackEvents = [
    { date: '2026-01-27', title: 'Isra Mi\'raj 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-02-17', title: 'Tahun Baru Imlek 2577', location: 'Vihara Sin Tek Bio', agama: 'Konghucu' },
    { date: '2026-02-18', title: 'Awal Ramadan 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-03-19', title: 'Idul Fitri 1447 H', location: 'Masjid Istiqlal', agama: 'Islam' },
    { date: '2026-04-05', title: 'Paskah', location: 'Gereja Katedral Jakarta', agama: 'Katolik' },
    { date: '2026-12-25', title: 'Perayaan Natal', location: 'Gereja Katedral Jakarta', agama: 'Katolik' }
];

// Load events dari backend API
async function loadCalendarEvents(year) {
    // Check cache dulu
    if (eventsCache[year]) {
        console.log(`✅ Using cached events for ${year}`);
        return eventsCache[year];
    }
    
    try {
        const response = await fetch(`/api/calendar/${year}`);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data.success && data.events) {
            console.log(`✅ Loaded ${data.events.length} events for ${year} from API`);
            eventsCache[year] = data.events;
            return data.events;
        }
    } catch (error) {
        console.warn('⚠️ Failed to load events from API, using fallback:', error);
    }
    
    // Fallback ke data manual
    return fallbackEvents.filter(e => e.date.startsWith(year.toString()));
}

// Initialize calendar saat halaman load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📅 Initializing calendar...');
    
    // Show loading state
    const calendarGrid = document.querySelector('.calendar-grid');
    const upcomingContainer = document.getElementById('upcomingEvents');
    if (calendarGrid) {
        calendarGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;">Loading...</div>';
    }
    if (upcomingContainer) {
        upcomingContainer.innerHTML = '<p style="color: #6c757d; text-align: center;">Memuat acara...</p>';
    }
    
    // Load events untuk tahun sekarang
    events = await loadCalendarEvents(currentYear);
    console.log(`✅ Loaded ${events.length} events for ${currentYear}`);
    
    // Pre-load events untuk tahun depan juga jika Desember
    if (currentMonth >= 11) {
        const nextYearEvents = await loadCalendarEvents(currentYear + 1);
        events = [...events, ...nextYearEvents];
    }
    
    renderCalendar();
    setupNavigation();
    setupEventsNavigation();
    renderUpcomingEvents();
});

async function renderCalendar() {
    const monthLabel = document.getElementById('currentMonth');
    monthLabel.textContent = `${months[currentMonth]} ${currentYear}`;
    
    const calendarGrid = document.querySelector('.calendar-grid');
    
    // Clear semua konten (termasuk loading state) kecuali header
    const headers = calendarGrid.querySelectorAll('.calendar-header');
    calendarGrid.innerHTML = '';
    headers.forEach(header => calendarGrid.appendChild(header));
    
    // Load events untuk tahun ini jika belum ada
    if (!eventsCache[currentYear]) {
        const yearEvents = await loadCalendarEvents(currentYear);
        events = [...events.filter(e => !e.date.startsWith(currentYear.toString())), ...yearEvents];
    }
    
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
    
    prevBtn.addEventListener('click', async function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
            // Load events untuk tahun baru ini
            if (!eventsCache[currentYear]) {
                const yearEvents = await loadCalendarEvents(currentYear);
                events = [...events, ...yearEvents];
            }
        }
        await renderCalendar();
    });
    
    nextBtn.addEventListener('click', async function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
            // Load events untuk tahun baru ini
            if (!eventsCache[currentYear]) {
                const yearEvents = await loadCalendarEvents(currentYear);
                events = [...events, ...yearEvents];
            }
        }
        await renderCalendar();
    });
}

// --- UPCOMING EVENTS WITH PAGINATION ---
let currentEventPage = 0;
const EVENTS_PER_PAGE = 5;

function setupEventsNavigation() {
    const prevBtn = document.getElementById('prevEvents');
    const nextBtn = document.getElementById('nextEvents');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentEventPage > 0) {
                currentEventPage--;
                renderUpcomingEvents();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const totalEvents = events.filter(e => new Date(e.date) >= today).length;
            const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
            
            if (currentEventPage < totalPages - 1) {
                currentEventPage++;
                renderUpcomingEvents();
            }
        });
    }
}

function updateEventsNavigationButtons(currentPage, totalPages) {
    const prevBtn = document.getElementById('prevEvents');
    const nextBtn = document.getElementById('nextEvents');
    
    if (!prevBtn || !nextBtn) return;
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1 || totalPages === 0;
    
    prevBtn.style.opacity = prevBtn.disabled ? '0.3' : '1';
    prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
    nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
    nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter all upcoming events
    const allUpcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (allUpcomingEvents.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">Tidak ada acara mendatang</p>';
        updateEventsNavigationButtons(0, 0);
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(allUpcomingEvents.length / EVENTS_PER_PAGE);
    const startIdx = currentEventPage * EVENTS_PER_PAGE;
    const endIdx = Math.min(startIdx + EVENTS_PER_PAGE, allUpcomingEvents.length);
    const upcomingEvents = allUpcomingEvents.slice(startIdx, endIdx);
    
    container.innerHTML = upcomingEvents.map(event => {
        const date = new Date(event.date);
        const day = date.getDate();
        const month = months[date.getMonth()].substring(0, 3);
        const style = religionStyle[event.agama] || { color: '#1a3a5c', icon: 'fa-calendar' };
        
        return `
            <div class="event-card">
                <div class="event-date" style="background: ${style.color};">
                    <span class="day">${String(day).padStart(2, '0')}</span>
                    <span class="month">${month.toUpperCase()}</span>
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
    
    // Update navigation buttons
    updateEventsNavigationButtons(currentEventPage, totalPages);
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
