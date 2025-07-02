// NASA API configuration - using your actual API key
const NASA_API_KEY = 'fUcjKcCbUlh1PbFjRpq2KfuvHVyOaCQGi6P7VwBr';
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Array of fun space facts
const SPACE_FACTS = [
    "A day on Venus is longer than its year! Venus rotates so slowly that one day (243 Earth days) is longer than one year (225 Earth days).",
    "Jupiter has at least 79 moons, including four large ones discovered by Galileo in 1610.",
    "The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes.",
    "One teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
    "Saturn's moon Titan has lakes and rivers made of liquid methane and ethane instead of water.",
    "The Milky Way galaxy contains an estimated 100-400 billion stars.",
    "Mars has the largest volcano in the solar system - Olympus Mons is about 13.6 miles high.",
    "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    "There are more possible games of chess than there are atoms in the observable universe.",
    "A single day on Mercury lasts about 59 Earth days, but a year is only 88 Earth days."
];

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Wait for the page to load completely
document.addEventListener('DOMContentLoaded', function() {
    // Display a random space fact when page loads
    displayRandomSpaceFact();
    
    // Get references to all the HTML elements we need
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const getImagesButton = document.getElementById('getImagesBtn');
    const galleryContainer = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    
    // Add click event listener to the button
    getImagesButton.addEventListener('click', function() {
        // Get the values from the date inputs
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Check if both dates are selected
        if (!startDate || !endDate) {
            alert('Please select both start and end dates!');
            return;
        }
        
        // Check if start date is before end date
        if (startDate > endDate) {
            alert('Start date must be before end date!');
            return;
        }
        
        // Call function to get space images
        getSpaceImages(startDate, endDate);
    });
    
    // Add click event to close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});

// Function to display a random space fact
function displayRandomSpaceFact() {
    const factElement = document.getElementById('fact-text');
    
    // Pick a random fact from our array
    const randomIndex = Math.floor(Math.random() * SPACE_FACTS.length);
    const randomFact = SPACE_FACTS[randomIndex];
    
    // Display the fact with a nice animation effect
    factElement.style.opacity = '0';
    setTimeout(function() {
        factElement.textContent = randomFact;
        factElement.style.opacity = '1';
    }, 300);
}

// Function to fetch space images from NASA API
async function getSpaceImages(startDate, endDate) {
    const galleryContainer = document.getElementById('gallery');
    
    // Show loading message
    galleryContainer.innerHTML = `
        <div class="loading">
            <p>🔄 Loading space photos...</p>
        </div>
    `;
    
    try {
        // Build the API URL with our parameters
        const apiUrl = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
        
        // Make the API request
        const response = await fetch(apiUrl);
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        // Convert the response to JSON data
        const spaceData = await response.json();
        
        // Display the images in the gallery
        displayGallery(spaceData);
        
    } catch (error) {
        // Show error message if something goes wrong
        console.error('Error fetching space images:', error);
        galleryContainer.innerHTML = `
            <div class="error">
                <p>❌ Failed to load space images. Please try again!</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Function to display all the space images in a gallery
function displayGallery(spaceData) {
    const galleryContainer = document.getElementById('gallery');
    
    // Clear the gallery
    galleryContainer.innerHTML = '';
    
    // Check if we have any data
    if (!spaceData || spaceData.length === 0) {
        galleryContainer.innerHTML = `
            <div class="error">
                <p>No images found for the selected date range.</p>
            </div>
        `;
        return;
    }
    
    // Loop through each space item and create gallery cards
    spaceData.forEach(function(spaceItem) {
        createGalleryItem(spaceItem);
    });
}

// Function to create a single gallery item (works for both images and videos)
function createGalleryItem(spaceItem) {
    const galleryContainer = document.getElementById('gallery');
    
    // Create a new div element for the gallery item
    const galleryCard = document.createElement('div');
    galleryCard.className = 'gallery-item';
    
    // Check if this is a video or image
    if (spaceItem.media_type === 'video') {
        // Handle video entries - show thumbnail image with video overlay
        galleryCard.innerHTML = `
            <div class="video-container">
                <img src="${spaceItem.thumbnail_url || spaceItem.url}" alt="${spaceItem.title}" loading="lazy" class="video-thumbnail-img">
                <div class="video-play-overlay">
                    <div class="play-button">▶</div>
                </div>
                <div class="video-badge">VIDEO</div>
            </div>
            <div class="gallery-info">
                <h3>${spaceItem.title}</h3>
                <p class="date">${formatDate(spaceItem.date)}</p>
                <p class="video-label">🎬 Click to watch video</p>
            </div>
        `;
    } else {
        // Handle image entries
        galleryCard.innerHTML = `
            <img src="${spaceItem.url}" alt="${spaceItem.title}" loading="lazy">
            <div class="gallery-info">
                <h3>${spaceItem.title}</h3>
                <p class="date">${formatDate(spaceItem.date)}</p>
            </div>
        `;
    }
    
    // Add click event to open modal when gallery item is clicked
    galleryCard.addEventListener('click', function() {
        openModal(spaceItem);
    });
    
    // Add the gallery item to the gallery container
    galleryContainer.appendChild(galleryCard);
}

// Function to format date in a readable way
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Function to open modal with detailed view (handles both images and videos)
function openModal(spaceItem) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    
    let mediaContent = '';
    
    // Check if this is a video or image
    if (spaceItem.media_type === 'video') {
        // Handle video content
        const videoId = getYouTubeVideoId(spaceItem.url);
        
        if (videoId) {
            // Embed YouTube video
            mediaContent = `
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allowfullscreen 
                    class="modal-video">
                </iframe>
            `;
        } else {
            // Fallback for non-YouTube videos
            mediaContent = `
                <div class="video-link">
                    <p>🎬 This is a video entry</p>
                    <a href="${spaceItem.url}" target="_blank" class="video-button">
                        Watch Video on NASA's Website
                    </a>
                </div>
            `;
        }
    } else {
        // Handle image content
        mediaContent = `
            <img src="${spaceItem.hdurl || spaceItem.url}" alt="${spaceItem.title}" class="modal-image">
        `;
    }
    
    // Create the modal content using template literal
    modalContent.innerHTML = `
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <div class="modal-body">
            ${mediaContent}
            <div class="modal-info">
                <h2>${spaceItem.title}</h2>
                <p class="modal-date">${formatDate(spaceItem.date)}</p>
                <p class="media-type">${spaceItem.media_type === 'video' ? '🎬 Video' : '📸 Image'}</p>
                <p class="modal-explanation">${spaceItem.explanation}</p>
            </div>
        </div>
    `;
    
    // Show the modal
    modal.style.display = 'block';
    
    // Prevent body from scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
    
    // Hide the modal
    modal.style.display = 'none';
    
    // Allow body to scroll again
    document.body.style.overflow = 'auto';
}
