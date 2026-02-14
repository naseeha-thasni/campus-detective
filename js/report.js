// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Set today's date as default
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
    
    const itemType = document.querySelector('input[name="itemType"]:checked').value;
    const itemName = document.getElementById('itemName').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            saveItem(itemType, itemName, location, date, description, contactInfo, event.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Default image (you can replace with your own default image)
        const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIi8+PC9zdmc+';
        saveItem(itemType, itemName, location, date, description, contactInfo, defaultImage);
    }
});

function saveItem(type, name, location, date, description, contactInfo, imageBase64) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const newItem = {
        id: Date.now().toString(),
        type: type,
        name: name,
        location: location,
        date: date,
        description: description,
        contactInfo: contactInfo,
        image: imageBase64,
        reporter: currentUser.email,
        reporterName: currentUser.fullName,
        loserEmail: type === 'lost' ? currentUser.email : ''
    };
    
    items.push(newItem);
    localStorage.setItem('items', JSON.stringify(items));
    
    alert('✅ Item reported successfully!');
    window.location.href = 'home.html';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});