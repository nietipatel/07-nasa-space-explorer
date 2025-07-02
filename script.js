// NASA API configuration
const NASA_API_KEY = 'DEMO_KEY'; // Replace with your actual API key
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Get DOM elements
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const getImagesButton = document.getElementById('get-images');
const galleryContainer = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close');


// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up button click handler
    getImagesButton.addEventListener('click', handleGetImages);
    
    // Set up modal close handlers
    closeModal.addEventListener('click', hideModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideModal();
        }
    });
});

// Main function to handle getting images
async function handleGetImages() {
    // Get the selected dates
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    // Validate that dates are selected
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    // Show loading message
    showLoading();
    
    try {
        // Fetch data from NASA API
        const spaceData = await fetchNASAData(startDate, endDate);
        
        // Display the gallery
        displayGallery(spaceData);
    } catch (error) {
        // Handle any errors
        showError('Failed to load space images. Please try again.');
        console.error('Error:', error);
    }
}

// Function to fetch data from NASA API
async function fetchNASAData(startDate, endDate) {
    // Build the API URL with parameters
    const apiUrl = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Make the API request
    const response = await fetch(apiUrl);
    
    // Check if request was successful
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    // Convert response to JSON
    const data = await response.json();
    return data;
}

// Function to display loading message
function showLoading() {
    galleryContainer.innerHTML = `
        <div class="loading">
            <p>🔄 Loading space photos...</p>
        </div>
    `;
}

// Function to show error message
function showError(message) {
    galleryContainer.innerHTML = `
        <div class="error">
            <p>❌ ${message}</p>
        </div>
    `;
}

// Function to display the gallery of images
function displayGallery(spaceData) {
    // Clear any existing content
    galleryContainer.innerHTML = '';
    
    // Check if we have data
    if (!spaceData || spaceData.length === 0) {
        showError('No images found for the selected date range.');
        return;
    }
    
    // Create gallery items for each space photo
    spaceData.forEach(function(item) {
        // Only show items that have images (not videos)
        if (item.media_type === 'image') {
            const galleryItem = createGalleryItem(item);
            galleryContainer.appendChild(galleryItem);
        }
    });
}

// Function to create a single gallery item
function createGalleryItem(spaceItem) {
    // Create the main container
    const itemDiv = document.createElement('div');
    itemDiv.className = 'gallery-item';
    
    // Add click handler to open modal
    itemDiv.addEventListener('click', function() {
        showModal(spaceItem);
    });
    
    // Create the HTML content for the gallery item
    itemDiv.innerHTML = `
        <img src="${spaceItem.url}" alt="${spaceItem.title}" loading="lazy">
        <div class="gallery-item-info">
            <h3>${spaceItem.title}</h3>
            <p class="date">${formatDate(spaceItem.date)}</p>
        </div>
    `;
    
    return itemDiv;
}

// Function to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to show modal with detailed view
function showModal(spaceItem) {
    // Create modal content
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <div class="modal-body">
            <img src="${spaceItem.hdurl || spaceItem.url}" alt="${spaceItem.title}" class="modal-image">
            <div class="modal-info">
                <h2>${spaceItem.title}</h2>
                <p class="modal-date">${formatDate(spaceItem.date)}</p>
                <p class="modal-explanation">${spaceItem.explanation}</p>
            </div>
        </div>
    `;
    
    // Re-add close event listener to new close button
    const newCloseButton = modalContent.querySelector('.close');
    newCloseButton.addEventListener('click', hideModal);
    
    // Show the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Function to hide modal
function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}
