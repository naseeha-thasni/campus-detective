// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Set today's date as default for date input
document.getElementById('date').valueAsDate = new Date();

// Image upload preview
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle form submission
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const itemType = document.querySelector('input[name="itemType"]:checked').value;
    const itemName = document.getElementById('itemName').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    
    // Process image
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            saveItem(itemType, itemName, location, date, description, event.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Use default image
        saveItem(itemType, itemName, location, date, description, 'assets/default-item.jpg');
    }
});

function saveItem(type, name, location, date, description, imageBase64) {
    // Get existing items
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create new item
    const newItem = {
        id: Date.now().toString(),
        type: type,
        name: name,
        location: location,
        date: date,
        description: description,
        image: imageBase64,
        reporter: currentUser.email,
        loserEmail: type === 'lost' ? currentUser.email : '' // For lost items, store loser's email
    };
    
    // Add to items array
    items.push(newItem);
    localStorage.setItem('items', JSON.stringify(items));
    
    alert('Item reported successfully!');
    window.location.href = 'home.html';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});