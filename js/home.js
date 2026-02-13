// Check if user is logged in
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Display welcome message
document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.fullName}!`;

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
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Update current filter
        currentFilter = this.dataset.filter;
        
        // Reload items
        loadItems();
    });
});

function loadItems() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const feed = document.getElementById('itemsFeed');
    
    // Apply filters
    let filteredItems = items;
    
    // Apply type filter
    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === currentFilter);
    }
    
    // Apply search filter
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
    
    // Generate HTML for each item
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
    
    return `
        <div class="item-card">
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='assets/default-item.jpg'">
            <div class="item-content">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-type ${item.type}">${item.type.toUpperCase()}</span>
                </div>
                <div class="item-location">${item.location}</div>
                <div class="item-date">${formatDate(item.date)}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-footer">
                    <span class="item-reporter">Reported by: ${getUserName(item.reporter)}</span>
                    ${isLoser ? `<button class="btn mark-returned-btn" data-id="${item.id}">✓ Mark Returned</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getUserName(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    return user ? user.fullName : email;
}

function markItemReturned(itemId) {
    // Get items and users
    let items = JSON.parse(localStorage.getItem('items')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find the item
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const item = items[itemIndex];
    
    // Verify current user is the loser
    if (item.loserEmail !== currentUser.email) {
        alert('You can only mark your own lost items as returned!');
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
        
        // Update currentUser in localStorage
        currentUser.points = users[userIndex].points;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update welcome message
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.fullName}! You have ${currentUser.points} points.`;
    }
    
    alert('Item marked as returned! You earned 10 points! 🎉');
    
    // Reload feed
    loadItems();
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Listen for storage events (for multi-tab support)
window.addEventListener('storage', function(e) {
    if (e.key === 'items' || e.key === 'currentUser') {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
        }
        loadItems();
    }
});