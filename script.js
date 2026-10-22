// 1. Select DOM elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Create/Select status element for the Custom Enhancement (Result Count)
let statusMessage = document.getElementById("status-message");
if (!statusMessage) {
  statusMessage = document.createElement("p");
  statusMessage.id = "status-message";
  statusMessage.style.margin = "1rem 0";
  statusMessage.style.fontWeight = "bold";
  resultsContainer.parentNode.insertBefore(statusMessage, resultsContainer);
}

// 2. Submit Event Listener
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Stop page reload

  const query = searchInput.value.trim();

  // Task 4: Ignore empty searches
  if (!query) return;

  await performSearch(query);
});

// 3. Fetch Function
async function performSearch(query) {
  try {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query" +
      "&generator=search&gsrsearch=" + encodeURIComponent(query) +
      "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

    const response = await fetch(url);

    // Task 2: Check response.ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Convert API pages object to array
    const items = data.query?.pages ? Object.values(data.query.pages) : [];

    // Pass items directly to render
    renderResults(items, query);
  } catch (error) {
    console.error("Error fetching data:", error);
    statusMessage.textContent = "Failed to load results. Please try again.";
  }
}

// 4. Render Function
function renderResults(items, query) {
  // Clear previous results
  resultsContainer.innerHTML = "";
  statusMessage.textContent = "";

  // Task 5 (Enhancement): Show result count status
  if (items.length === 0) {
    statusMessage.textContent = `No results found for "${query}".`;
    return;
  }

  statusMessage.textContent = `Showing ${items.length} results for "${query}"`;

  // Build card elements
  items.forEach((item) => {
    const imageUrl = item.imageinfo?.[0]?.thumburl;
    const pageUrl = item.imageinfo?.[0]?.descriptionurl;
    const title = item.title.replace("File:", "");

    if (!imageUrl) return;

    const card = document.createElement("article");
    card.className = "card";

    // Enhancement: Clickable link opening source page
    const link = document.createElement("a");
    link.href = pageUrl || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = title;

    const caption = document.createElement("p");
    caption.textContent = title;

    link.appendChild(img);
    card.appendChild(link);
    card.appendChild(caption);

    resultsContainer.appendChild(card);
  });
}