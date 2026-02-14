// Check if user is logged in
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Update welcome message with points
updateWelcomeMessage();

// Global variables
let currentFilter = 'all';
let searchTerm = '';

// Load items on page load
loadItems();

// Search functionality
document.getElementById('searchBtn').addEventListener('click', function() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase();
    loadItems();
});

document.getElementById('searchInput').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        searchTerm = this.value.toLowerCase();
        loadItems();
    }
});

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        loadItems();
    });
});

function loadItems() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const feed = document.getElementById('itemsFeed');
    
    // Apply filters
    let filteredItems = items;
    
    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === currentFilter);
    }
    
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredItems.length === 0) {
        feed.innerHTML = '<p class="no-data">No items found</p>';
        return;
    }
    
    feed.innerHTML = filteredItems.map(item => createItemCard(item)).join('');
    
    // Add event listeners to mark returned buttons
    document.querySelectorAll('.mark-returned-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.id;
            markItemReturned(itemId);
        });
    });
}

function createItemCard(item) {
    const isLoser = currentUser.email === item.loserEmail;
    const reporter = getUserInfo(item.reporter);
    
    return `
        <div class="item-card">
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIi8+PC9zdmc+Jw=='">
            <div class="item-content">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-type ${item.type}">${item.type.toUpperCase()}</span>
                </div>
                
                <div class="item-location">${item.location}</div>
                <div class="item-date">${formatDate(item.date)}</div>
                
                <div class="item-description">${item.description}</div>
                
                <!-- Contact Information Section -->
                <div class="item-contact">
                    <span class="contact-icon">📞</span>
                    <div>
                        <span class="contact-label">Contact:</span>
                        <span class="contact-value">${item.contactInfo}</span>
                    </div>
                </div>
                
                <div class="item-footer">
                    <div class="item-reporter">
                        Reported by: ${reporter.fullName} (${item.reporter})
                    </div>
                    ${isLoser ? `<button class="btn mark-returned-btn" data-id="${item.id}">✓ Mark Returned (+10 pts)</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function getUserInfo(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    return user || { fullName: 'Unknown User', email: email };
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function markItemReturned(itemId) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const item = items[itemIndex];
    
    if (item.loserEmail !== currentUser.email) {
        alert('❌ You can only mark your own lost items as returned!');
        return;
    }
    
    // Remove the item
    items.splice(itemIndex, 1);
    localStorage.setItem('items', JSON.stringify(items));
    
    // Add points to current user
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].points += 10;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update currentUser
        currentUser.points = users[userIndex].points;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update welcome message
        updateWelcomeMessage();
    }
    
    alert('✅ Item marked as returned! You earned 10 points! 🎉');
    loadItems();
}

function updateWelcomeMessage() {
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Welcome back, ${currentUser.fullName}!<br> 
                              <span style="font-size: 14px; opacity: 0.9;">You have ${currentUser.points} points</span>`;
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Listen for storage events
window.addEventListener('storage', function(e) {
    if (e.key === 'items' || e.key === 'users' || e.key === 'currentUser') {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
        }
        updateWelcomeMessage();
        loadItems();
    }
});