// Select DOM elements from your index.html
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');
const statusMsg = document.getElementById('status');
const resultsGrid = document.getElementById('results');
const categoryChips = document.querySelectorAll('.chip');

// 1. Handle Form Submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchImages(query);
  }
});

// 2. Handle Category Chips Click
categoryChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const query = chip.textContent.trim();
    searchInput.value = query;
    fetchImages(query);
  });
});

// 3. Handle Clear Button Reset
clearBtn.addEventListener('click', () => {
  resultsGrid.innerHTML = '';
  statusMsg.textContent = 'Search for a topic above to explore images.';
});

// Main async function to handle API requests and state management
async function fetchImages(query) {
  // --- STATE 1: LOADING STATE ---
  resultsGrid.innerHTML = ''; // Clear existing cards
  statusMsg.textContent = `Searching images for "${query}"...`; // Show loading status[cite: 1]

  try {
    // Full HTTPS API URL for Wikimedia Commons API
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=16&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;

    const response = await fetch(url);

    // Check if network response is valid
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // --- STATE 2: EMPTY STATE ---
    if (!data.query || !data.query.pages) {
      statusMsg.textContent = `No images found for "${query}". Try searching another topic!`; //[cite: 1]
      return;
    }

    const items = Object.values(data.query.pages);

    // Filter items to ensure they contain displayable image thumbnails
    const itemsWithImages = items.filter((item) => item.thumbnail);

    if (itemsWithImages.length === 0) {
      statusMsg.textContent = `No displayable image previews found for "${query}". Try another search term.`; //[cite: 1]
      return;
    }

    // --- STATE 3: RESULTS STATE ---
    statusMsg.textContent = `Showing ${itemsWithImages.length} results for "${query}"`; //[cite: 1]
    renderResults(itemsWithImages);

  } catch (error) {
    // --- STATE 4: ERROR STATE ---
    console.error('Fetch error:', error);
    statusMsg.textContent = 'Something went wrong while loading images. Please check your connection and try again.'; //[cite: 1]
  }
}

// Function to dynamically render image cards
function renderResults(items) {
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'image-card';

    const img = document.createElement('img');
    img.src = item.thumbnail.source;
    img.alt = item.title ? item.title.replace(/^File:/, '') : 'Search image';
    img.loading = 'lazy'; // Improve page loading performance

    const title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = item.title ? item.title.replace(/^File:/, '') : 'Untitled image';

    card.appendChild(img);
    card.appendChild(title);
    resultsGrid.appendChild(card);
  });
}