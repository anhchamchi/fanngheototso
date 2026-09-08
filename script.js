const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbz4f9nXo0nTEDnNA85dxkjNPpUtCSBsckP6x-5k0SrLYn1ATPr7VeOB1eBQeOoahK_aeQ/exec'; 

let eventsData = [];
let currentDate = new Date();

const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('monthYear');
const loadingEl = document.getElementById('loading');

const modalOverlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('closeBtn');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalDetail = document.getElementById('modalDetail');
const modalLinks = document.getElementById('modalLinks');

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function fetchEvents() {
    try {
        const response = await fetch(SHEET_API_URL + "?t=" + new Date().getTime());
        eventsData = await response.json();
        loadingEl.style.display = 'none';
        renderCalendar();
    } catch (error) {
        loadingEl.innerText = "Lỗi khi tải dữ liệu!";
        console.error('Error fetching data:', error);
    }
}

function renderCalendar() {
    calendarEl.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearEl.innerText = `Tháng ${month + 1} - ${year}`;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        calendarEl.appendChild(emptyDiv);
    }

    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        
        const dateString = `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        dayDiv.innerHTML = `<div class="date-num">${i}</div>`;

        const dayEvents = eventsData.filter(e => e.date === dateString);
        
        dayEvents.forEach(dayEvent => {
            const eventIndicator = document.createElement('div');
            eventIndicator.classList.add('event-indicator');
           
            const titleEl = document.createElement('div');
            titleEl.classList.add('event-title');
            titleEl.innerText = dayEvent.title ? dayEvent.title.toUpperCase() : 'CÓ SỰ KIỆN';
            eventIndicator.appendChild(titleEl);
            
            let iconHtml = '';
            if (dayEvent.rabbit === true || String(dayEvent.icon1).toUpperCase() === 'TRUE') { iconHtml += '<span>🐰</span>'; }
            if (dayEvent.pineapple === true || String(dayEvent.icon2).toUpperCase() === 'TRUE') { iconHtml += '<span>🍍</span>'; }
            if (dayEvent.dragon === true || String(dayEvent.icon3).toUpperCase() === 'TRUE') { iconHtml += '<span>🐉</span>'; }
            if (dayEvent.DaLAB === true || String(dayEvent.icon4).toUpperCase() === 'TRUE') { iconHtml += '<span>🧪</span>'; }

            if (iconHtml !== '') {
                const iconsEl = document.createElement('div');
                iconsEl.classList.add('event-icons');
                iconsEl.innerHTML = iconHtml;
                eventIndicator.appendChild(iconsEl);
            }

            eventIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(dateString, dayEvent);
            });

            dayDiv.appendChild(eventIndicator);
        });
    
        calendarEl.appendChild(dayDiv);
    }

    const totalRenderedCells = firstDayIndex + lastDay;
    const remainingCells = (7 - (totalRenderedCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        calendarEl.appendChild(emptyDiv);
    }
}

function openModal(dateStr, eventObj) {
    modalDate.innerText = `Ngày: ${dateStr}`;
    modalTitle.innerText = eventObj.title ? capitalizeFirstLetter(eventObj.title) : 'Sự Kiện';
    modalDetail.innerText = eventObj.detail ? capitalizeFirstLetter(eventObj.detail) : ''; 
    modalLinks.innerHTML = '';

    const platforms = ['tiktok', 'thread', 'fb', 'ig', 'youtube'];
    
    platforms.forEach(platform => {
        if (eventObj[platform]) {
            const a = document.createElement('a');
            a.href = eventObj[platform];
            a.target = '_blank';
            a.classList.add('link-btn');
            a.innerText = platform.toUpperCase();
            modalLinks.appendChild(a);
        }
    });

    modalOverlay.style.display = 'flex';
}

closeBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = 'none';
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

fetchEvents();

async function fetchEvents() {
    
    const cachedData = localStorage.getItem('calendarEvents');
    
    if (cachedData) {
        eventsData = JSON.parse(cachedData);
        loadingEl.style.display = 'none'; 
        renderCalendar(); 
    } else {
        loadingEl.style.display = 'block'; 
    }
    try {
        const response = await fetch(SHEET_API_URL + "?t=" + new Date().getTime());
        const newData = await response.json();

        if (newData && newData.length >= 0) {
            eventsData = newData;
            localStorage.setItem('calendarEvents', JSON.stringify(eventsData)); 
            
            loadingEl.style.display = 'none';
            renderCalendar(); 
        }
    } catch (error) {
 
        if (!cachedData) { 
            loadingEl.innerText = "Lỗi khi tải dữ liệu từ máy chủ!";
        }
        console.error('Error fetching data:', error);
    }
}

setInterval(async () => {
    try {
        const response = await fetch(SHEET_API_URL + "?t=" + new Date().getTime());
        const newData = await response.json();
        
        if (newData && newData.length >= 0) {
            eventsData = newData;
      
            localStorage.setItem('calendarEvents', JSON.stringify(eventsData));
            renderCalendar(); 
        }
    } catch (error) {
        console.error('Lỗi đồng bộ ngầm:', error);
    }
}, 30000);
