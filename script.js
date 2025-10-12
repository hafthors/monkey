// --- Core Quiz Functionality ---

/**
 * Toggles the visibility of the answer for a specific quiz card.
 * @param {HTMLElement} buttonElement - The button that was clicked.
 */
function toggleAnswer(buttonElement) {
    const card = buttonElement.closest('.quiz-card');
    const answerContent = card.querySelector('.answer-content');
    
    // Toggle the display style
    if (answerContent.style.display === 'block') {
        answerContent.style.display = 'none';
        buttonElement.textContent = 'Show Answer';
    } else {
        answerContent.style.display = 'block';
        buttonElement.textContent = 'Hide Answer';
    }
}

/**
 * Toggles the global dark mode setting.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    // Visually update the toggle switch (if it's present on the page)
    const toggleCircle = document.querySelector('.toggle-circle');
    if (toggleCircle) {
        // Optional: The CSS handles the visual update based on the body class, 
        // but this ensures the JS logic is self-contained.
    }
}

// Function to apply saved dark mode preference on page load
function loadDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}


// --- Bookmark Functionality ---

// Key for localStorage
const BOOKMARKS_STORAGE_KEY = 'quizAppBookmarks';

/**
 * Gets the current set of bookmarked card IDs from localStorage.
 * @returns {Set<string>} A Set of bookmarked card IDs.
 */
function getBookmarks() {
    const bookmarkedIds = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return bookmarkedIds ? new Set(JSON.parse(bookmarkedIds)) : new Set();
}

/**
 * Saves the Set of bookmarked IDs back to localStorage.
 * @param {Set<string>} bookmarks - The Set of bookmarked card IDs.
 */
function saveBookmarks(bookmarks) {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(bookmarks)));
}

/**
 * Toggles the bookmark state for a quiz card.
 * @param {HTMLElement} iconElement - The bookmark icon that was clicked.
 */
function toggleBookmark(iconElement) {
    const card = iconElement.closest('.quiz-card');
    const cardId = card.dataset.id;
    const bookmarks = getBookmarks();
    
    // Toggle 'active' class on the icon
    iconElement.classList.toggle('active');
    
    if (iconElement.classList.contains('active')) {
        // Add bookmark
        bookmarks.add(cardId);
    } else {
        // Remove bookmark
        bookmarks.delete(cardId);
        
        // If on the bookmarks page, remove the card entirely
        if (document.getElementById('bookmarksPage')) {
            card.remove();
            renderBookmarksPage(); // Re-check if any are left
        }
    }
    
    saveBookmarks(bookmarks);
}

/**
 * Initializes the bookmark icons on the main page based on localStorage.
 */
function initializeBookmarksOnIndex() {
    const bookmarks = getBookmarks();
    document.querySelectorAll('.quiz-card').forEach(card => {
        const cardId = card.dataset.id;
        const icon = card.querySelector('.bookmark-icon');
        
        if (bookmarks.has(cardId)) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
}


/**
 * Renders the bookmarked cards on the bookmarks page.
 */
function renderBookmarksPage() {
    const bookmarksPage = document.getElementById('bookmarksPage');
    const bookmarks = getBookmarks();
    const noBookmarksMessage = document.getElementById('no-bookmarks-message');

    // Clear existing content
    bookmarksPage.querySelectorAll('.quiz-card').forEach(card => card.remove());

    if (bookmarks.size === 0) {
        noBookmarksMessage.classList.remove('hidden');
        return;
    }
    
    noBookmarksMessage.classList.add('hidden');

    // Retrieve all cards from the main page (we need all card data)
    // In a real app, this data would come from a central JSON/API, 
    // but here we rely on the main page structure.
    const allQuizCardsData = Array.from(document.querySelectorAll('#homePage .quiz-card')).map(card => {
        // Clone the card and strip elements we don't want to store (like the answer-content display state)
        const clone = card.cloneNode(true);
        clone.querySelector('.answer-content').style.display = 'none';
        clone.querySelector('.show-answer-btn').textContent = 'Show Answer';
        return {
            id: card.dataset.id,
            html: clone.outerHTML
        };
    });
    
    // Simplified approach: If we were on index.html, we'd clone cards directly.
    // Since we're on bookmarks.html, we need to load or generate the HTML.
    
    // **Alternative and easier approach for a small app:**
    // On the Bookmarks page, we'll try to find the full card data. 
    // For a simple two-page structure, we'll store the full HTML of bookmarked cards.
    // For a scalable app, you'd store the ID and load the data. 
    
    // For this demonstration, let's clone the cards from the index page's template 
    // by storing/retrieving the full HTML on bookmark.
    
    // **Since we can't reliably load index.html's DOM:**
    // We'll require all cards to be defined in a master array of objects in this JS file.
    // However, to stick to the original HTML structure as much as possible, let's use the
    // "store the full card HTML" approach for simplicity in a small project.
    
    // Let's refactor: The `toggleBookmark` should store/remove the *card's HTML* // in addition to the ID, so we can display it on the bookmarks page.
    
    const bookmarkedCardsHTML = JSON.parse(localStorage.getItem('bookmarkedCardsHTML') || '[]');
    
    bookmarkedCardsHTML.forEach(cardHTML => {
        // Create a temporary element to safely inject the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const card = tempDiv.firstElementChild;
        
        // Ensure the bookmark is set to active and answer is hidden
        const icon = card.querySelector('.bookmark-icon');
        icon.classList.add('active');
        card.querySelector('.answer-content').style.display = 'none';
        card.querySelector('.show-answer-btn').textContent = 'Show Answer';

        bookmarksPage.appendChild(card);
    });
}

/**
 * NEW: Toggles the bookmark state and updates HTML storage.
 * @param {HTMLElement} iconElement - The bookmark icon that was clicked.
 */
function toggleBookmark(iconElement) {
    const card = iconElement.closest('.quiz-card');
    const cardId = card.dataset.id;
    let bookmarkedCardsHTML = JSON.parse(localStorage.getItem('bookmarkedCardsHTML') || '[]');
    
    iconElement.classList.toggle('active');
    
    if (iconElement.classList.contains('active')) {
        // Add bookmark: Store the cleaned HTML (answer hidden, button text set)
        const cardClone = card.cloneNode(true);
        cardClone.querySelector('.answer-content').style.display = 'none';
        cardClone.querySelector('.show-answer-btn').textContent = 'Show Answer';
        
        // Prevent duplicate storage
        const isAlreadyBookmarked = bookmarkedCardsHTML.some(html => 
            new DOMParser().parseFromString(html, 'text/html').body.querySelector('.quiz-card').dataset.id === cardId
        );

        if (!isAlreadyBookmarked) {
            bookmarkedCardsHTML.push(cardClone.outerHTML);
        }

    } else {
        // Remove bookmark
        bookmarkedCardsHTML = bookmarkedCardsHTML.filter(html => 
            new DOMParser().parseFromString(html, 'text/html').body.querySelector('.quiz-card').dataset.id !== cardId
        );

        // If on the bookmarks page, remove the card from the DOM
        if (document.getElementById('bookmarksPage')) {
            card.remove();
            // We re-render to check for the 'no bookmarks' message
            document.getElementById('bookmarksPage').innerHTML = ''; // Quick clear
            renderBookmarksPage(); 
        }
    }
    
    localStorage.setItem('bookmarkedCardsHTML', JSON.stringify(bookmarkedCardsHTML));

    // After updating storage, re-initialize icons on index page to sync states
    if (!document.getElementById('bookmarksPage')) {
        initializeBookmarksOnIndex();
    }
}


// --- Initialization ---

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
    
    // Check which page we are on
    if (document.getElementById('homePage')) {
        // We are on index.html
        initializeBookmarksOnIndex();
    } else if (document.getElementById('bookmarksPage')) {
        // We are on bookmarks.html
        renderBookmarksPage();
    }
});
