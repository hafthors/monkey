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
}

// Function to apply saved dark mode preference on page load
function loadDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

// --- Bookmark Functionality ---

// Key for localStorage
const BOOKMARKED_CARDS_KEY = 'bookmarkedQuizCards';

/**
 * Gets the current array of bookmarked card HTML strings from localStorage.
 * @returns {Array<string>} An array of bookmarked card HTML strings.
 */
function getBookmarkedCards() {
    const bookmarkedCards = localStorage.getItem(BOOKMARKED_CARDS_KEY);
    try {
        return bookmarkedCards ? JSON.parse(bookmarkedCards) : [];
    } catch (e) {
        console.error("Error parsing bookmarked cards from localStorage:", e);
        return [];
    }
}

/**
 * Saves the array of bookmarked card HTML strings back to localStorage.
 * @param {Array<string>} cards - The array of card HTML strings.
 */
function saveBookmarkedCards(cards) {
    localStorage.setItem(BOOKMARKED_CARDS_KEY, JSON.stringify(cards));
}

/**
 * Toggles the bookmark state for a quiz card and saves/removes it from storage.
 * @param {HTMLElement} iconElement - The bookmark icon that was clicked.
 */
function toggleBookmark(iconElement) {
    const card = iconElement.closest('.quiz-card');
    const cardId = card.dataset.id;
    let bookmarkedCardsHTML = getBookmarkedCards();
    
    iconElement.classList.toggle('active');
    
    if (iconElement.classList.contains('active')) {
        // --- ADD BOOKMARK ---
        
        // 1. Create a clean clone of the card for storage
        const cardClone = card.cloneNode(true);
        // Ensure the answer is hidden and button is reset for the stored version
        cardClone.querySelector('.answer-content').style.display = 'none';
        cardClone.querySelector('.show-answer-btn').textContent = 'Show Answer';
        
        // 2. Check if already bookmarked (prevent duplicates)
        const isAlreadyBookmarked = bookmarkedCardsHTML.some(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.querySelector('.quiz-card')?.dataset.id === cardId;
        });

        // 3. Add to array if new
        if (!isAlreadyBookmarked) {
            bookmarkedCardsHTML.push(cardClone.outerHTML);
        }

    } else {
        // --- REMOVE BOOKMARK ---
        
        // 1. Filter out the card with the matching ID
        bookmarkedCardsHTML = bookmarkedCardsHTML.filter(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.querySelector('.quiz-card')?.dataset.id !== cardId;
        });

        // 2. If on the bookmarks page, physically remove the card from the DOM
        if (document.getElementById('bookmarksPage')) {
            card.remove();
        }
    }
    
    // 3. Save the updated array
    saveBookmarkedCards(bookmarkedCardsHTML);

    // 4. Re-render the bookmarks page to update the "no bookmarks" message
    if (document.getElementById('bookmarksPage')) {
        renderBookmarksPage(true); // Pass true to only check the message state
    }
}

/**
 * Initializes the bookmark icons on the main page based on localStorage.
 */
function initializeBookmarksOnIndex() {
    const bookmarkedCardsHTML = getBookmarkedCards();
    const bookmarkedIds = new Set(bookmarkedCardsHTML.map(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.querySelector('.quiz-card')?.dataset.id;
    }).filter(id => id)); // Get a Set of all bookmarked IDs
    
    document.querySelectorAll('#homePage .quiz-card').forEach(card => {
        const cardId = card.dataset.id;
        const icon = card.querySelector('.bookmark-icon');
        
        if (icon && bookmarkedIds.has(cardId)) {
            icon.classList.add('active');
        } else if (icon) {
            icon.classList.remove('active');
        }
    });
}

/**
 * Renders the bookmarked cards on the dedicated bookmarks page.
 * @param {boolean} checkOnly - If true, only checks and updates the "no bookmarks" message.
 */
function renderBookmarksPage(checkOnly = false) {
    const bookmarksPage = document.getElementById('bookmarksPage');
    if (!bookmarksPage) return; // Exit if not on the bookmarks page
    
    const bookmarkedCardsHTML = getBookmarkedCards();
    const noBookmarksMessage = document.getElementById('no-bookmarks-message');

    if (bookmarkedCardsHTML.length === 0) {
        if (noBookmarksMessage) noBookmarksMessage.classList.remove('hidden');
        // Clear all cards if we have 0 bookmarks (in case a card was removed)
        if (!checkOnly) { 
            bookmarksPage.querySelectorAll('.quiz-card').forEach(card => card.remove());
        }
        return;
    }
    
    if (noBookmarksMessage) noBookmarksMessage.classList.add('hidden');

    if (checkOnly) return;

    // Clear and rebuild the list to handle dynamic changes
    bookmarksPage.innerHTML = '';
    
    bookmarkedCardsHTML.forEach(cardHTML => {
        // Create a temporary element to safely inject the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const card = tempDiv.firstElementChild;
        
        // Ensure the bookmark is set to active and answer is hidden (redundant, but safe)
        const icon = card.querySelector('.bookmark-icon');
        if (icon) icon.classList.add('active');
        const answerContent = card.querySelector('.answer-content');
        if (answerContent) answerContent.style.display = 'none';
        const showBtn = card.querySelector('.show-answer-btn');
        if (showBtn) showBtn.textContent = 'Show Answer';
        
        bookmarksPage.appendChild(card);
    });
}


// --- Initialization ---

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Dark Mode preference
    loadDarkModePreference();
    
    // 2. Initialize page-specific functionality
    if (document.getElementById('homePage')) {
        // We are on index.html
        initializeBookmarksOnIndex();
    } else if (document.getElementById('bookmarksPage')) {
        // We are on bookmarks.html
        renderBookmarksPage();
    }
});
