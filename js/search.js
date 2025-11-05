/**
 * Search System
 * Client-side search across all content types
 */

const SearchSystem = {
    // Search index built from all content
    searchIndex: [],

    // Search state
    isIndexed: false,
    isSearchOpen: false,
    currentResults: [],
    selectedResultIndex: 0,

    // DOM elements
    elements: {
        overlay: null,
        input: null,
        results: null,
        closeBtn: null
    },

    /**
     * Initialize search system
     */
    async init() {
        console.log('SearchSystem: Initializing');

        this.cacheElements();
        this.setupEventListeners();
        await this.buildSearchIndex();

        console.log('SearchSystem: Initialized with', this.searchIndex.length, 'items');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.overlay = document.getElementById('search-overlay');
        this.elements.input = document.getElementById('search-input');
        this.elements.results = document.getElementById('search-results');
        this.elements.closeBtn = document.querySelector('.close-search');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input
        if (this.elements.input) {
            this.elements.input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            this.elements.input.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
        }

        // Close button
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => {
                this.closeSearch();
            });
        }

        // Click outside to close
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', (e) => {
                if (e.target === this.elements.overlay) {
                    this.closeSearch();
                }
            });
        }
    },

    /**
     * Build search index from all content controllers
     */
    async buildSearchIndex() {
        this.searchIndex = [];

        // Index personal photography
        if (window.PhotographyController && window.PhotographyController.photos) {
            Object.values(window.PhotographyController.photos).forEach(photo => {
                this.searchIndex.push({
                    type: 'photo',
                    id: photo.id,
                    title: photo.title,
                    description: photo.description || '',
                    location: photo.location || '',
                    tags: photo.tags || [],
                    contentType: 'Personal Photography',
                    route: `/photography/${photo.collection}`,
                    data: photo
                });
            });
        }

        // Index personal writings
        if (window.WritingsController && window.WritingsController.writings) {
            Object.values(window.WritingsController.writings).forEach(writing => {
                this.searchIndex.push({
                    type: 'writing',
                    id: writing.filename || writing.title,
                    title: writing.title,
                    description: writing.excerpt || '',
                    tags: writing.tags || [],
                    contentType: 'Personal Writings',
                    route: '/works/personal/writings',
                    data: writing
                });
            });
        }

        // Index personal music
        if (window.MusicController && window.MusicController.tracks) {
            Object.values(window.MusicController.tracks).forEach(track => {
                this.searchIndex.push({
                    type: 'music',
                    id: track.id,
                    title: track.title,
                    description: track.description || '',
                    tags: track.genres || [],
                    contentType: 'Personal Music',
                    route: '/works/personal/music',
                    data: track
                });
            });
        }

        // Index personal projects
        if (window.ProjectsController && window.ProjectsController.projects) {
            Object.values(window.ProjectsController.projects).forEach(project => {
                this.searchIndex.push({
                    type: 'project',
                    id: project.id,
                    title: project.title,
                    description: project.description || '',
                    tags: project.technologies || [],
                    contentType: 'Personal Projects',
                    route: '/works/personal/projects',
                    data: project
                });
            });
        }

        // Index curated writings
        if (window.CuratedWritingsController && window.CuratedWritingsController.writings) {
            Object.values(window.CuratedWritingsController.writings).forEach(writing => {
                this.searchIndex.push({
                    type: 'curated_writing',
                    id: writing.id,
                    title: writing.title,
                    description: writing.excerpt || '',
                    author: writing.author || '',
                    tags: writing.tags || [],
                    contentType: 'Curated Writings',
                    route: `/works/curated/writings/${writing.collection}`,
                    data: writing
                });
            });
        }

        // Index curated cinema
        if (window.CuratedCinemaController && window.CuratedCinemaController.cinema) {
            Object.values(window.CuratedCinemaController.cinema).forEach(item => {
                this.searchIndex.push({
                    type: 'curated_cinema',
                    id: item.id,
                    title: item.title,
                    description: item.excerpt || '',
                    director: item.director || '',
                    tags: item.genres || [],
                    contentType: 'Curated Cinema',
                    route: `/works/curated/cinema/${item.collection}`,
                    data: item
                });
            });
        }

        // Index curated music
        if (window.CuratedMusicController && window.CuratedMusicController.music) {
            Object.values(window.CuratedMusicController.music).forEach(item => {
                this.searchIndex.push({
                    type: 'curated_music',
                    id: item.id,
                    title: item.title,
                    description: item.excerpt || '',
                    artist: item.artist || '',
                    tags: item.genres || [],
                    contentType: 'Curated Music',
                    route: `/works/curated/music/${item.collection}`,
                    data: item
                });
            });
        }

        // Index curated misc
        if (window.CuratedMiscController && window.CuratedMiscController.items) {
            Object.values(window.CuratedMiscController.items).forEach(item => {
                this.searchIndex.push({
                    type: 'curated_misc',
                    id: item.id,
                    title: item.title,
                    description: item.excerpt || '',
                    creator: item.creator || '',
                    tags: item.tags || [],
                    contentType: 'Curated Content',
                    route: `/works/curated/misc/${item.collection}`,
                    data: item
                });
            });
        }

        this.isIndexed = true;
        console.log('SearchSystem: Index built with', this.searchIndex.length, 'items');
    },

    /**
     * Perform search across all content
     * @param {string} query - Search query
     * @returns {Array} Search results
     */
    search(query) {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();
        const results = [];

        this.searchIndex.forEach(item => {
            let score = 0;

            // Title match (highest weight)
            if (item.title.toLowerCase().includes(normalizedQuery)) {
                score += 10;
            }

            // Description match
            if (item.description.toLowerCase().includes(normalizedQuery)) {
                score += 5;
            }

            // Author/Director/Creator match
            if (item.author && item.author.toLowerCase().includes(normalizedQuery)) {
                score += 7;
            }
            if (item.director && item.director.toLowerCase().includes(normalizedQuery)) {
                score += 7;
            }
            if (item.creator && item.creator.toLowerCase().includes(normalizedQuery)) {
                score += 7;
            }

            // Location match (for photos)
            if (item.location && item.location.toLowerCase().includes(normalizedQuery)) {
                score += 6;
            }

            // Tag match
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(normalizedQuery)) {
                        score += 8;
                    }
                });
            }

            // Content type match
            if (item.contentType.toLowerCase().includes(normalizedQuery)) {
                score += 3;
            }

            // If any match, add to results
            if (score > 0) {
                results.push({ ...item, score });
            }
        });

        // Sort by score (highest first)
        results.sort((a, b) => b.score - a.score);

        return results;
    },

    /**
     * Handle search input
     * @param {string} query - Search query
     */
    handleSearch(query) {
        if (!query || query.trim().length === 0) {
            this.currentResults = [];
            this.renderResults([]);
            return;
        }

        this.currentResults = this.search(query);
        this.selectedResultIndex = 0;
        this.renderResults(this.currentResults);
    },

    /**
     * Render search results
     * @param {Array} results - Search results to render
     */
    renderResults(results) {
        if (!this.elements.results) return;

        if (results.length === 0) {
            this.elements.results.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const resultsHTML = results.map((result, index) => {
            const selectedClass = index === this.selectedResultIndex ? 'selected' : '';
            const metadata = this.getResultMetadata(result);

            return `
                <div class="search-result ${selectedClass}" data-index="${index}">
                    <div class="result-content">
                        <h3 class="result-title">${this.highlightMatch(result.title)}</h3>
                        ${metadata ? `<p class="result-meta">${metadata}</p>` : ''}
                        ${result.description ? `<p class="result-description">${this.truncate(result.description, 150)}</p>` : ''}
                        <span class="result-type">${result.contentType}</span>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.results.innerHTML = resultsHTML;

        // Add click handlers
        this.elements.results.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                this.selectResult(index);
            });
        });
    },

    /**
     * Get metadata string for result
     * @param {Object} result - Search result
     * @returns {string} Metadata string
     */
    getResultMetadata(result) {
        if (result.author) return `by ${result.author}`;
        if (result.director) return `directed by ${result.director}`;
        if (result.creator) return `by ${result.creator}`;
        if (result.artist) return `by ${result.artist}`;
        if (result.location) return result.location;
        return '';
    },

    /**
     * Highlight search query in text (simple implementation)
     * @param {string} text - Text to highlight
     * @returns {string} Text with highlights
     */
    highlightMatch(text) {
        // For now, just return the text
        // Could enhance with actual highlighting later
        return text;
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Handle keyboard navigation in search results
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNavigation(event) {
        if (this.currentResults.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedResultIndex = Math.min(
                    this.selectedResultIndex + 1,
                    this.currentResults.length - 1
                );
                this.renderResults(this.currentResults);
                this.scrollToSelected();
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, 0);
                this.renderResults(this.currentResults);
                this.scrollToSelected();
                break;

            case 'Enter':
                event.preventDefault();
                this.selectResult(this.selectedResultIndex);
                break;

            case 'Escape':
                event.preventDefault();
                this.closeSearch();
                break;
        }
    },

    /**
     * Scroll to selected result
     */
    scrollToSelected() {
        const selectedElement = this.elements.results.querySelector('.search-result.selected');
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },

    /**
     * Select and navigate to a search result
     * @param {number} index - Result index to select
     */
    selectResult(index) {
        const result = this.currentResults[index];
        if (!result) return;

        console.log('SearchSystem: Selected result:', result);

        // Navigate to the appropriate route
        if (result.route && window.Router) {
            window.Router.navigateTo(result.route);
        }

        // Close search
        this.closeSearch();

        // Open in lightbox if applicable
        // Small delay to let navigation complete
        setTimeout(() => {
            this.openResultInLightbox(result);
        }, 300);
    },

    /**
     * Open search result in appropriate lightbox
     * @param {Object} result - Search result to open
     */
    openResultInLightbox(result) {
        if (!window.UniversalContentLightbox) return;

        switch (result.type) {
            case 'photo':
                if (window.PhotographyController) {
                    window.PhotographyController.openPhotoInLightbox(result.id);
                }
                break;

            case 'writing':
                if (window.WritingsController) {
                    window.WritingsController.openWritingInLightbox(result.id);
                }
                break;

            case 'music':
                if (window.MusicController) {
                    window.MusicController.openTrackInLightbox(result.id);
                }
                break;

            case 'project':
                if (window.ProjectsController) {
                    window.ProjectsController.openProjectInLightbox(result.id);
                }
                break;

            case 'curated_writing':
                if (window.CuratedWritingsController) {
                    window.CuratedWritingsController.openWritingInLightbox(result.id);
                }
                break;

            case 'curated_cinema':
                if (window.CuratedCinemaController) {
                    window.CuratedCinemaController.openCinemaInLightbox(result.id);
                }
                break;

            case 'curated_music':
                if (window.CuratedMusicController) {
                    window.CuratedMusicController.openMusicInLightbox(result.id);
                }
                break;

            case 'curated_misc':
                if (window.CuratedMiscController) {
                    window.CuratedMiscController.openItemInLightbox(result.id);
                }
                break;
        }
    },

    /**
     * Open search overlay
     */
    openSearch() {
        if (!this.elements.overlay) return;

        this.isSearchOpen = true;
        this.elements.overlay.classList.remove('hidden');
        this.elements.overlay.classList.add('entering');

        // Focus search input
        if (this.elements.input) {
            this.elements.input.value = '';
            this.elements.input.focus();
        }

        // Clear previous results
        this.currentResults = [];
        this.selectedResultIndex = 0;
        this.renderResults([]);

        setTimeout(() => {
            this.elements.overlay.classList.remove('entering');
        }, 300);
    },

    /**
     * Close search overlay
     */
    closeSearch() {
        if (!this.elements.overlay) return;

        this.isSearchOpen = false;
        this.elements.overlay.classList.add('exiting');

        setTimeout(() => {
            this.elements.overlay.classList.remove('exiting');
            this.elements.overlay.classList.add('hidden');
        }, 200);
    },

    /**
     * Toggle search overlay
     */
    toggleSearch() {
        if (this.isSearchOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }
};

// Export to window for global access
window.SearchSystem = SearchSystem;
