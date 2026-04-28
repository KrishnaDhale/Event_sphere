const defaultEvents = [
    { id: 1, title: "Arijit Concert", date: "2026-05-10", location: "MCA Pune", price: 5000, image: "resources/arijit.jpg", gallery : ["resources/arijit1.jpg" , "resources/crowdImage1.jpeg" , "resources/crowdImage2.jpeg" , "resources/crowdImage3.jpeg"] ,desc: "A great Concert with melody of Arijit Singh's Voice." },
    { id: 2, title: "Shreya Ghoshal's Melody", date: "2026-05-15", location: "Open Grounds , Mumbai", price: 5000, image: "resources/shreya.jpg", gallery : ["resources/shreya1.jpg" , "resources/crowdImage1.jpeg" , "resources/crowdImage2.jpeg" , "resources/crowdImage3.jpeg"] ,desc: "Live music of Shreya Ghoshal." },
    { id: 3, title: "Badshah DJ Night", date: "2026-06-01", location: "D Y Patil Stadium ,Mumbai", price: 3000, image: "resources/badshah.jpg", gallery : ["resources/badshah1.jpg" , "resources/crowdImage1.jpeg" , "resources/crowdImage2.jpeg" , "resources/crowdImage3.jpeg"] ,desc: "experience of music with Badshah." },
    { id: 4, title: "Music Of Arman Malik", date: "2026-06-10", location: "New York , America", price: 4000, image: "resources/arman.jpg", gallery : ["resources/arman1.jpg" , "resources/crowdImage1.jpeg" , "resources/crowdImage2.jpeg" , "resources/crowdImage3.jpeg"] ,desc: "Watch Arman Malik live on stage." }
];
const defaultResale = [
    { ticketId: 201, eventTitle: "Arijit Concert", date: "2026-05-10", location: "MCA Pune", price: 5000, image: "resources/arijit.jpg", originalBuyer: "Onkar" },
    { ticketId: 202, eventTitle: "Arijit Concert", date: "2026-05-10", location: "MCA Pune", price: 5000, image: "resources/arijit.jpg", originalBuyer: "Vaibhav" },
    { ticketId: 203, eventTitle: "Badshah DJ Night", date: "2026-05-15", location: "D Y Patil Stadium ,Mumbai", price: 3000, image: "resources/badshah.jpg", originalBuyer: "Sneha" },
    { ticketId: 204, eventTitle: "Badshah DJ Night", date: "2026-05-15", location: "D Y Patil Stadium ,Mumbai", price: 3000, image: "resources/badshah.jpg", originalBuyer: "Vaibhav" },
    { ticketId: 205, eventTitle: "Badshah DJ Night", date: "2026-06-01", location: "D Y Patil Stadium ,Mumbai", price: 3000, image: "resources/badshah.jpg", originalBuyer: "Onkar" }
];

document.addEventListener('DOMContentLoaded', () => {
    if(typeof checkAuth === 'function') checkAuth(); 
    initData();
    renderPageContent();
});

function initData() {
    if (!localStorage.getItem('events')) localStorage.setItem('events', JSON.stringify(defaultEvents));
    if (!localStorage.getItem('resaleMarket')) localStorage.setItem('resaleMarket', JSON.stringify(defaultResale));
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        if (!localStorage.getItem(`tickets_${currentUser.email}`)) localStorage.setItem(`tickets_${currentUser.email}`, JSON.stringify([]));
        
        // Give user a dummy 'Sold' ticket instantly to see the green badge working!
        if (!localStorage.getItem(`resale_status_${currentUser.email}`)) {
            const demoSold = [{ ticketId: 999, eventTitle: "Arijit Singh Event", date: "2026-06-10", location: "MCA Pune", price: 5000, image: "resources/arijit.jpg", originalBuyer: currentUser.name, status: "Sold" }];
            localStorage.setItem(`resale_status_${currentUser.email}`, JSON.stringify(demoSold));
        }
    }
}

let currentCarouselIndex = 0; // Added for the gallery

function renderPageContent() {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (path.includes('home.html') || path.endsWith('/')) { renderHeroSection(); renderEvents(); }
    if (path.includes('my-tickets.html')) renderMyTickets();
    if (path.includes('resale.html')) renderResaleMyTickets(); 
    if (path.includes('event-details.html') && eventId) renderEventDetails(parseInt(eventId));
    if (path.includes('book-ticket.html') && eventId) renderCheckoutPage(parseInt(eventId));
    
    // NEW: Route for Profile
    if (path.includes('profile.html')) renderProfilePage();
}

// --- NEW: Hero Section Logic ---
function renderHeroSection() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.email}`)) || [];
    const heroContainer = document.getElementById('hero-content');
    
    if (!heroContainer || !currentUser) return;

    // Create a User ID from their name (e.g., "John Doe" -> "John")
    const userId = currentUser.name.split(' ')[0];

    let upcomingEventHtml = '';
    
    if (myTickets.length > 0) {
        // User HAS booked a ticket
        upcomingEventHtml = `
            <div class="upcoming-status">
                <h3>Your Upcoming Event</h3>
                <p>You are ready for <strong>${myTickets[0].title}</strong> on ${myTickets[0].date}!</p>
                <button class="btn-primary hero-btn" onclick="window.location.href='my-tickets.html'">View Ticket</button>
            </div>
        `;
    } else {
        // User has NO tickets
        upcomingEventHtml = `
            <div class="upcoming-status">
                <h3>Your Upcoming Event</h3>
                <p>You have no events booked. Book one now!</p>
                <button class="btn-primary hero-btn" onclick="scrollToEvents()">Book Now</button>
            </div>
        `;
    }

    heroContainer.innerHTML = `
        <h1 class="hero-title">Welcome, ${userId}!</h1>
        <p class="hero-subtitle">Dive into the most exciting experiences happening around you.</p>
        ${upcomingEventHtml}
    `;
}

function scrollToEvents() {
    document.getElementById('browse-events-section').scrollIntoView({ behavior: 'smooth' });
}

// --- Home Page Logic ---
function renderEvents(eventsToRender = null) {
    const events = eventsToRender || JSON.parse(localStorage.getItem('events'));
    const container = document.getElementById('events-container');
    if(!container) return;
    
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">No events found matching your search.</p>';
        return;
    }

    events.forEach(event => {
        container.innerHTML += `
            <div class="event-card">
                <img src="${event.image}" alt="Event Image" style="cursor:pointer;" onclick="window.location.href='event-details.html?id=${event.id}'">
                <div class="event-details">
                    <h3>${event.title}</h3>
                    <p>📍 ${event.location} | 📅 ${event.date}</p>
                    <p>${event.desc.substring(0, 50)}...</p>
                    <p class="price">₹${event.price}</p>
                    <button class="btn-primary" onclick="window.location.href='event-details.html?id=${event.id}'">View Details</button>
                </div>
            </div>
        `;
    });
}

function filterEvents() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const events = JSON.parse(localStorage.getItem('events'));
    
    const filtered = events.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.location.toLowerCase().includes(query) ||
        e.desc.toLowerCase().includes(query)
    );
    
    renderEvents(filtered);
}

function bookEvent(eventId) {
    const events = JSON.parse(localStorage.getItem('events'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTicketsKey = `tickets_${currentUser.email}`;
    let myTickets = JSON.parse(localStorage.getItem(userTicketsKey)) || [];

    const eventToBook = events.find(e => e.id === eventId);
    
    const ticket = {
        ...eventToBook,
        ticketId: new Date().getTime(),
        originalBuyer: currentUser.name
    };

    myTickets.push(ticket);
    localStorage.setItem(userTicketsKey, JSON.stringify(myTickets));
    
    // Re-render hero section to update the "Upcoming Event" widget immediately
    renderHeroSection(); 
    alert('Ticket Booked Successfully!');
}

// --- My Tickets Logic ---
function renderMyTickets(ticketsToRender = null) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById('my-tickets-container');
    if(!container) return;
    
    // Use passed array (if searching) OR get all tickets from storage
    const myTickets = ticketsToRender || JSON.parse(localStorage.getItem(`tickets_${currentUser.email}`)) || [];
    container.innerHTML = '';

    if (myTickets.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light); font-size: 1.1rem; padding: 3rem;">No tickets found. <br><a href="home.html" style="color: var(--primary-color); text-decoration: none; font-weight: 600; margin-top: 10px; display: inline-block;">Browse Events</a></p>';
        return;
    }

    myTickets.forEach(ticket => {
        container.innerHTML += `
            <div class="event-card" style="cursor: pointer;" onclick="openTicketModal(${ticket.ticketId})">
                <img src="${ticket.image}" alt="Event Image">
                <div class="event-details">
                    <h3>${ticket.title}</h3>
                    <p>📍 ${ticket.location} | 📅 ${ticket.date}</p>
                    <p class="price" style="font-size: 1rem; color: var(--success-color);">🎫 Tap to view Pass</p>
                </div>
            </div>
        `;
    });
}

// NEW: Search filter specifically for My Tickets
function filterMyTickets() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.email}`)) || [];
    
    const filtered = myTickets.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.location.toLowerCase().includes(query)
    );
    
    renderMyTickets(filtered);
}

function openTicketModal(ticketId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.email}`)) || [];
    const ticket = myTickets.find(t => t.ticketId === ticketId);

    if (ticket) {
        // Populate modal data
        document.getElementById('modalEventTitle').innerText = ticket.title;
        document.getElementById('modalEventDate').innerText = ticket.date;
        document.getElementById('modalEventLocation').innerText = ticket.location;
        document.getElementById('modalTicketId').innerText = "#" + ticket.ticketId;
        
        // Configure the resell button
        const resellBtn = document.getElementById('modalResellBtn');
        resellBtn.onclick = () => resellTicket(ticket.ticketId);

        // Show modal
        document.getElementById('ticketModal').classList.add('active');
    }
}

function closeModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

function resellTicket(ticketId) {
    if(!confirm("Are you sure you want to list this ticket on the Resale Market? You will lose access to it.")) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTicketsKey = `tickets_${currentUser.email}`;
    const userStatusKey = `resale_status_${currentUser.email}`;
    
    let myTickets = JSON.parse(localStorage.getItem(userTicketsKey)) || [];
    let resaleMarket = JSON.parse(localStorage.getItem('resaleMarket')) || [];
    let myResaleStatus = JSON.parse(localStorage.getItem(userStatusKey)) || []; 

    const ticketIndex = myTickets.findIndex(t => t.ticketId === ticketId);
    
    if (ticketIndex > -1) {
        const ticketToSell = myTickets[ticketIndex];
        const resaleItem = {
            ticketId: ticketToSell.ticketId,
            eventTitle: ticketToSell.title,
            date: ticketToSell.date,
            location: ticketToSell.location,
            price: ticketToSell.price,
            image: ticketToSell.image,
            originalBuyer: ticketToSell.originalBuyer || currentUser.name
        };

        resaleMarket.push(resaleItem);
        myTickets.splice(ticketIndex, 1);
        myResaleStatus.push({...resaleItem, status: 'Unsold'}); // Track status

        localStorage.setItem(userTicketsKey, JSON.stringify(myTickets));
        localStorage.setItem('resaleMarket', JSON.stringify(resaleMarket));
        localStorage.setItem(userStatusKey, JSON.stringify(myResaleStatus));
        
        if (typeof closeModal === 'function') closeModal();
        alert('Ticket successfully listed on the Resale Market!');
        
        // Re-render based on page
        if(document.getElementById('my-tickets-container')) renderMyTickets();
        if(document.getElementById('resale-your-tickets-container')) renderResaleMyTickets();
    }
}
// ==========================================
// --- NEW RESALE MARKET TAB LOGIC ---
// ==========================================

function switchResaleTab(event, tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    if(tabId === 'tab-your-tickets') renderResaleMyTickets();
    if(tabId === 'tab-purchase') renderResalePurchase();
    if(tabId === 'tab-check-status') renderResaleStatus();
}

// TAB 1: Your Tickets
// TAB 1: Your Tickets
function renderResaleMyTickets() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById('resale-your-tickets-container');
    if(!container) return;
    const myTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.email}`)) || [];
    container.innerHTML = '';
    
    if (myTickets.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 16px; border: 1px dashed var(--border-color);"><p style="color: var(--text-light); font-size: 1.1rem;">You do not have any tickets available for resale.</p></div>';
        return;
    }

    // Group tickets by event title so the user doesn't see 10 identical cards
    const grouped = {};
    myTickets.forEach(ticket => {
        if(!grouped[ticket.title]) {
            grouped[ticket.title] = { ...ticket, tickets: [] };
        }
        grouped[ticket.title].tickets.push(ticket);
    });

    Object.values(grouped).forEach(event => {
        container.innerHTML += `
            <div class="event-card" style="cursor: pointer;" onclick="openMyTicketResaleModal('${event.title}')">
                <img src="${event.image}" alt="Event Image">
                <div class="event-details">
                    <h3>${event.title}</h3>
                    <p>📍 ${event.location} | 📅 ${event.date}</p>
                    <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border-color);">
                        <p class="price" style="font-size: 1rem; color: var(--primary-color);">🎫 You have <strong>${event.tickets.length}</strong> ticket(s)</p>
                    </div>
                </div>
            </div>`;
    });
}

// NEW: Modal logic for Your Tickets
function openMyTicketResaleModal(eventTitle) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.email}`)) || [];
    const tickets = myTickets.filter(t => t.title === eventTitle);
    
    if(tickets.length > 0) {
        const event = tickets[0];
        document.getElementById('myTicketModalTitle').innerText = event.title;
        document.getElementById('myTicketModalLocDate').innerText = `📍 ${event.location} | 📅 ${event.date}`;
        document.getElementById('myTicketModalCount').innerText = tickets.length;
        document.getElementById('myTicketModalImg').src = event.image;
        
        const resellBtn = document.getElementById('myTicketModalResellBtn');
        
        // When clicked, resell ONLY the first ticket from this group
        resellBtn.onclick = () => {
            resellTicket(tickets[0].ticketId);
            closeMyTicketResaleModal();
        };
        
        document.getElementById('resaleMyTicketModal').classList.add('active');
    }
}

function closeMyTicketResaleModal() {
    document.getElementById('resaleMyTicketModal').classList.remove('active');
}

// TAB 2: Purchase (Grouped by Event)
function renderResalePurchase() {
    const container = document.getElementById('resale-purchase-container');
    const resaleMarket = JSON.parse(localStorage.getItem('resaleMarket')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    container.innerHTML = '';

    const grouped = {};
    resaleMarket.forEach(ticket => {
        // Hide tickets the user themselves put up for sale from the purchase view
        if(ticket.originalBuyer !== currentUser.name) {
            if(!grouped[ticket.eventTitle]) {
                grouped[ticket.eventTitle] = { ...ticket, tickets: [] };
            }
            grouped[ticket.eventTitle].tickets.push(ticket);
        }
    });

    const eventKeys = Object.keys(grouped);
    if(eventKeys.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1; color: #666; padding: 2rem;">No resale tickets available from other users.</p>';
        return;
    }

    eventKeys.forEach(key => {
        const event = grouped[key];
        container.innerHTML += `
            <div class="event-card" style="cursor: pointer;" onclick="openResaleSellersModal('${event.eventTitle}')">
                <img src="${event.image}" alt="Event Image">
                <div class="event-details">
                    <h3>${event.eventTitle}</h3>
                    <p>📍 ${event.location} | 📅 ${event.date}</p>
                    <p class="price" style="margin-top:auto; font-size: 1rem;">🎫 ${event.tickets.length} Tickets Available</p>
                </div>
            </div>
        `;
    });
}

function openResaleSellersModal(eventTitle) {
    const resaleMarket = JSON.parse(localStorage.getItem('resaleMarket')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tickets = resaleMarket.filter(t => t.eventTitle === eventTitle && t.originalBuyer !== currentUser.name);
    
    const sellerList = document.getElementById('resaleSellersList');
    sellerList.innerHTML = '';
    document.getElementById('resaleModalTitle').innerText = `${eventTitle}`;

    tickets.forEach(t => {
        sellerList.innerHTML += `
            <div class="seller-item">
                <div>
                    <strong style="color:var(--primary-color);">Seller: ${t.originalBuyer}</strong>
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top:2px;">Original Price: ₹${t.price}</p>
                </div>
                <button class="btn-success" style="padding: 8px 16px; width: auto; font-size:0.9rem;" onclick="buyResaleTicket(${t.ticketId})">Buy Now</button>
            </div>
        `;
    });

    document.getElementById('resaleSellersModal').classList.add('active');
}

function closeResaleSellersModal() {
    document.getElementById('resaleSellersModal').classList.remove('active');
}

function buyResaleTicket(ticketId) {
    let resaleMarket = JSON.parse(localStorage.getItem('resaleMarket'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTicketsKey = `tickets_${currentUser.email}`;
    let myTickets = JSON.parse(localStorage.getItem(userTicketsKey)) || [];

    const ticketIndex = resaleMarket.findIndex(t => t.ticketId === ticketId);

    if (ticketIndex > -1) {
        const boughtTicket = resaleMarket[ticketIndex];
        const newMyTicket = {
            id: new Date().getTime(),
            ticketId: new Date().getTime(),
            title: boughtTicket.eventTitle,
            date: boughtTicket.date,
            location: boughtTicket.location,
            price: boughtTicket.price,
            image: boughtTicket.image,
            desc: `Purchased from Resale Market (Seller: ${boughtTicket.originalBuyer})`
        };

        myTickets.push(newMyTicket);
        resaleMarket.splice(ticketIndex, 1); // remove from market

        localStorage.setItem(userTicketsKey, JSON.stringify(myTickets));
        localStorage.setItem('resaleMarket', JSON.stringify(resaleMarket));

        // Magically update original seller's status to 'Sold' if it exists in local storage
        for(let i=0; i<localStorage.length; i++) {
            let key = localStorage.key(i);
            if(key.startsWith('resale_status_')) {
                let statusArr = JSON.parse(localStorage.getItem(key));
                let statIdx = statusArr.findIndex(t => t.ticketId === ticketId);
                if(statIdx > -1) {
                    statusArr[statIdx].status = 'Sold';
                    localStorage.setItem(key, JSON.stringify(statusArr));
                    break;
                }
            }
        }

        closeResaleSellersModal();
        alert('Ticket purchased successfully! It has been added to My Tickets.');
        renderResalePurchase(); 
    }
}

// TAB 3: Check Status
function renderResaleStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const statusKey = `resale_status_${currentUser.email}`;
    const myResaleStatus = JSON.parse(localStorage.getItem(statusKey)) || [];
    const container = document.getElementById('resale-check-status-container');
    container.innerHTML = '';

    if(myResaleStatus.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1; color: #666; padding: 2rem;">You have no tickets currently listed for resale.</p>';
        return;
    }

    myResaleStatus.forEach(ticket => {
        const isSold = ticket.status === 'Sold';
        const statusBadge = isSold ? `<span class="badge-sold">Sold</span>` : `<span class="badge-unsold">Unsold</span>`;
        const actionBtn = isSold ? `` : `<button class="btn-primary" style="margin-top: auto;" onclick="cancelResale(${ticket.ticketId})">Cancel Resale</button>`;

        container.innerHTML += `
            <div class="event-card" style="border: ${isSold ? '2px solid var(--success-color)' : '1px solid var(--border-color)'};">
                <img src="${ticket.image}" alt="Event Image">
                <div class="event-details">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 style="margin:0;">${ticket.eventTitle}</h3>
                        ${statusBadge}
                    </div>
                    <p>📍 ${ticket.location} | 📅 ${ticket.date}</p>
                    <p class="price" style="font-size: 1rem; margin-bottom: 15px;">Original Price: ₹${ticket.price}</p>
                    ${actionBtn}
                </div>
            </div>
        `;
    });
}

function cancelResale(ticketId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTicketsKey = `tickets_${currentUser.email}`;
    const userStatusKey = `resale_status_${currentUser.email}`;
    
    let myTickets = JSON.parse(localStorage.getItem(userTicketsKey)) || [];
    let resaleMarket = JSON.parse(localStorage.getItem('resaleMarket')) || [];
    let myResaleStatus = JSON.parse(localStorage.getItem(userStatusKey)) || [];

    resaleMarket = resaleMarket.filter(t => t.ticketId !== ticketId);
    
    const statusIndex = myResaleStatus.findIndex(t => t.ticketId === ticketId);
    if(statusIndex > -1) {
        const cancelledTicket = myResaleStatus[statusIndex];
        myResaleStatus.splice(statusIndex, 1);
        
        myTickets.push({
            id: cancelledTicket.ticketId, 
            ticketId: cancelledTicket.ticketId,
            title: cancelledTicket.eventTitle,
            date: cancelledTicket.date,
            location: cancelledTicket.location,
            price: cancelledTicket.price,
            image: cancelledTicket.image,
            desc: "Recovered from Resale Market"
        });
        
        localStorage.setItem(userTicketsKey, JSON.stringify(myTickets));
        localStorage.setItem('resaleMarket', JSON.stringify(resaleMarket));
        localStorage.setItem(userStatusKey, JSON.stringify(myResaleStatus));
        
        alert("Resale Cancelled. Ticket is back in 'Your Tickets'.");
        renderResaleStatus();
    }
}

// ==========================================
// --- EVENT DETAILS PAGE LOGIC ---
// ==========================================
function renderEventDetails(eventId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        alert("Event not found!");
        window.location.href = 'home.html';
        return;
    }

    // Populate Data
    document.getElementById('ed-title').innerText = event.title;
    document.getElementById('ed-subtitle').innerText = `📍 ${event.location} | 📅 ${event.date}`;
    document.getElementById('ed-desc').innerText = event.desc + " Join us for an unforgettable experience filled with amazing performances, networking, and fun!";
    document.getElementById('ed-sticky-price').innerText = `₹${event.price}`;
    
    // Set dynamic hero background
    document.getElementById('ed-hero').style.backgroundImage = `url('${event.image}')`;
    
    // Mock Random Tickets Available for realism
    document.getElementById('ed-tickets-left').innerText = Math.floor(Math.random() * 50) + 15;

    // Attach Sticky Booking Button
    const bookBtn = document.getElementById('ed-book-btn');
    bookBtn.onclick = () => {
        window.location.href = `book-ticket.html?id=${eventId}`;
    };
    const galleryImages = event.gallery ? event.gallery : [event.image, 'resources/image1.jpg', 'resources/image1.jpg'];
    renderCarousel(galleryImages);
}

function renderCarousel(images) {
    const track = document.getElementById('carouselTrack');
    
    track.innerHTML = '';
    images.forEach(img => {
        track.innerHTML += `<img src="${img}" class="carousel-slide" alt="Gallery Image">`;
    });
    
    updateCarousel();
}
function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    currentCarouselIndex += direction;
    
    if (currentCarouselIndex < 0) currentCarouselIndex = slides.length - 1;
    if (currentCarouselIndex >= slides.length) currentCarouselIndex = 0;
    
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const slideWidth = document.querySelector('.carousel-slide')?.clientWidth || 0;
    track.style.transform = `translateX(-${currentCarouselIndex * slideWidth}px)`;
}

// ==========================================
// --- CHECKOUT & PAYMENT LOGIC ---
// ==========================================
let currentCheckoutEvent = null;

function renderCheckoutPage(eventId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    currentCheckoutEvent = events.find(e => e.id === eventId);
    
    if (!currentCheckoutEvent) {
        alert("Event data lost. Redirecting home.");
        window.location.href = 'home.html';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Pre-fill user data
    document.getElementById('buyerName').value = currentUser.name;
    document.getElementById('buyerEmail').value = currentUser.email;

    // Fill Summary details
    document.getElementById('chkEventTitle').innerText = currentCheckoutEvent.title;
    document.getElementById('chkEventDate').innerText = currentCheckoutEvent.date;
    document.getElementById('chkEventImg').src = currentCheckoutEvent.image;
    document.getElementById('chkBasePrice').innerText = `₹${currentCheckoutEvent.price}`;
    
    updateCheckoutTotal();
}

function updateCheckoutTotal() {
    if(!currentCheckoutEvent) return;
    
    let count = parseInt(document.getElementById('ticketCount').value);
    if(count > 5) { count = 5; document.getElementById('ticketCount').value = 5; }
    if(count < 1) { count = 1; document.getElementById('ticketCount').value = 1; }

    const baseTotal = count * currentCheckoutEvent.price;
    const platformFee = 50;
    const finalTotal = baseTotal + platformFee;

    document.getElementById('chkQty').innerText = `x${count}`;
    document.getElementById('chkTotalAmount').innerText = `₹${finalTotal}`;
}

function openPaymentModal() {
    const form = document.getElementById('checkoutForm');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const count = document.getElementById('ticketCount').value;
    const totalAmount = document.getElementById('chkTotalAmount').innerText;

    document.getElementById('payModalTotal').innerText = totalAmount;
    document.getElementById('payModalDetails').innerText = `${currentCheckoutEvent.title} (x${count} Tickets)`;
    
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.onclick = () => processPayment(parseInt(count));

    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function processPayment(ticketCount) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTicketsKey = `tickets_${currentUser.email}`;
    let myTickets = JSON.parse(localStorage.getItem(userTicketsKey)) || [];

    // Generate separate ticket instances if they buy multiple (so they can resell individually)
    for(let i=0; i<ticketCount; i++) {
        const ticket = {
            ...currentCheckoutEvent,
            ticketId: new Date().getTime() + i, // Unique ID per ticket
            originalBuyer: currentUser.name
        };
        myTickets.push(ticket);
    }

    localStorage.setItem(userTicketsKey, JSON.stringify(myTickets));
    
    closePaymentModal();
    alert(`Payment Successful! You have booked ${ticketCount} ticket(s) for ${currentCheckoutEvent.title}.`);
    window.location.href = 'my-tickets.html';
}

// ==========================================
// --- PROFILE PAGE LOGIC ---
// ==========================================
function renderProfilePage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

    // Set UI details
    document.getElementById('profName').innerText = currentUser.name;
    document.getElementById('profEmail').innerText = currentUser.email;

    // Pre-fill edit modal
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editEmail').value = currentUser.email;

    // Attach form listeners
    document.getElementById('editProfileForm').onsubmit = (e) => {
        e.preventDefault();
        const newName = document.getElementById('editName').value;
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        
        if(userIndex > -1) {
            users[userIndex].name = newName;
            currentUser.name = newName;
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            document.getElementById('profName').innerText = newName;
            closeProfileModal('editProfileModal');
            alert('Profile updated successfully!');
        }
    };

    document.getElementById('changePasswordForm').onsubmit = (e) => {
        e.preventDefault();
        const currPass = document.getElementById('currPass').value;
        const newPass = document.getElementById('newPass').value;
        const confPass = document.getElementById('confPass').value;

        if(currPass !== currentUser.password) {
            alert('Current password is incorrect!');
            return;
        }
        if(newPass !== confPass) {
            alert('New passwords do not match!');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        
        if(userIndex > -1) {
            users[userIndex].password = newPass;
            currentUser.password = newPass;
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            closeProfileModal('changePasswordModal');
            document.getElementById('changePasswordForm').reset();
            alert('Password changed successfully!');
        }
    };

    document.getElementById('contactUsForm').onsubmit = (e) => {
        e.preventDefault();
        closeProfileModal('contactUsModal');
        document.getElementById('contactUsForm').reset();
        alert('Thank you! Your message has been sent to the EventSphere support team.');
    };
}

function openProfileModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeProfileModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}