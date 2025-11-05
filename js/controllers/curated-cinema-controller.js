/**
 * Curated Cinema Controller
 * Manages display of curated films and TV shows
 */

const CuratedCinemaController = {
    cinema: null,
    collections: null,

    /**
     * Initialize controller - Load curated cinema data
     */
    async init() {
        console.log('CuratedCinemaController: Initializing');
        await this.loadCinemaData();
    },

    /**
     * Load curated cinema from JSON file
     */
    async loadCinemaData() {
        try {
            const response = await fetch('content/curated/cinema/curated-cinema.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            this.collections = data.collections || {};

            // Convert items array to object keyed by ID for easy lookup
            this.cinema = {};
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    this.cinema[item.id] = item;
                });
            }

            console.log('CuratedCinemaController: Loaded', Object.keys(this.cinema).length, 'cinema items');
        } catch (error) {
            console.error('CuratedCinemaController: Failed to load curated cinema:', error);
            this.cinema = {};
            this.collections = {};
        }
    },

    /**
     * Render curated cinema view
     * @param {string} collectionId - Optional collection ID to filter by
     */
    render(collectionId = null) {
        console.log('CuratedCinemaController: Rendering', collectionId || 'overview');

        if (!this.cinema || Object.keys(this.cinema).length === 0) {
            this.renderEmptyState();
            return;
        }

        if (collectionId) {
            this.renderCollection(collectionId);
        } else {
            this.renderCollectionOverview();
        }
    },

    /**
     * Render collection overview - Show all collections on 4 walls
     */
    renderCollectionOverview() {
        const room = document.getElementById('room');
        if (!room) return;

        // Clear all walls
        ['leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'].forEach(wall => {
            const content = document.getElementById(`${wall}-content`);
            if (content) content.innerHTML = '';
        });

        // Use 4-wall layout
        room.className = 'room four-wall-layout';

        const collectionIds = Object.keys(this.collections);
        const walls = ['leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'];

        collectionIds.forEach((collectionId, index) => {
            if (index >= walls.length) return;

            const collection = this.collections[collectionId];
            const content = document.getElementById(`${walls[index]}-content`);

            if (content) {
                content.innerHTML = this.createCollectionButton(collectionId, collection);
            }
        });
    },

    /**
     * Create a collection button for the wall
     * @param {string} collectionId - Collection identifier
     * @param {Object} collection - Collection data
     * @returns {string} HTML string
     */
    createCollectionButton(collectionId, collection) {
        const itemsInCollection = Object.values(this.cinema)
            .filter(c => c.collection === collectionId).length;

        return `
            <button class="wall-button" onclick="CuratedCinemaController.navigateToCollection('${collectionId}')">
                <div class="button-content">
                    <h2>${collection.name}</h2>
                    <p class="wall-description">${collection.description}</p>
                    <p class="wall-meta">${itemsInCollection} ${itemsInCollection === 1 ? 'item' : 'items'}</p>
                </div>
            </button>
        `;
    },

    /**
     * Navigate to a specific collection
     * @param {string} collectionId - Collection ID to navigate to
     */
    navigateToCollection(collectionId) {
        if (window.Router) {
            Router.navigateTo(`/works/curated/cinema/${collectionId}`);
        }
    },

    /**
     * Render a specific collection's cinema items on the 4 walls
     * @param {string} collectionId - Collection ID to render
     */
    renderCollection(collectionId) {
        const room = document.getElementById('room');
        if (!room) return;

        // Clear all walls
        ['leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'].forEach(wall => {
            const content = document.getElementById(`${wall}-content`);
            if (content) content.innerHTML = '';
        });

        // Use 4-wall layout
        room.className = 'room four-wall-layout';

        // Get cinema items in this collection
        const itemsInCollection = Object.values(this.cinema)
            .filter(c => c.collection === collectionId)
            .sort((a, b) => {
                // Sort by featured first, then by date added
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.dateAdded) - new Date(a.dateAdded);
            });

        const walls = ['leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'];

        itemsInCollection.forEach((item, index) => {
            if (index >= walls.length) return;

            const content = document.getElementById(`${walls[index]}-content`);
            if (content) {
                content.innerHTML = this.createCinemaButton(item, itemsInCollection);
            }
        });
    },

    /**
     * Create a cinema item button for the wall
     * @param {Object} item - Cinema item data
     * @param {Array} itemArray - Array of all cinema items for navigation
     * @returns {string} HTML string
     */
    createCinemaButton(item, itemArray) {
        const featuredBadge = item.featured ? '<span class="featured-badge">Recommended</span>' : '';
        const typeLabel = item.type === 'film' ? 'Film' : 'TV Series';

        return `
            <button class="wall-button" onclick='CuratedCinemaController.openCinemaInLightbox("${item.id}", ${JSON.stringify(itemArray.map(i => i.id))})'>
                <div class="button-content">
                    <h2>${item.title}</h2>
                    ${item.director ? `<p class="wall-meta">Directed by ${item.director}</p>` : ''}
                    ${item.year ? `<p class="wall-meta">${typeLabel} • ${item.year}</p>` : `<p class="wall-meta">${typeLabel}</p>`}
                    ${item.excerpt ? `<p class="writing-excerpt">${item.excerpt}</p>` : ''}
                    ${featuredBadge}
                </div>
            </button>
        `;
    },

    /**
     * Open a cinema item in the lightbox
     * @param {string} itemId - Cinema item ID to open
     * @param {Array} itemIds - Array of cinema item IDs for navigation
     */
    openCinemaInLightbox(itemId, itemIds = null) {
        const item = this.cinema[itemId];
        if (!item) {
            console.error('CuratedCinemaController: Cinema item not found:', itemId);
            return;
        }

        // Build navigation array if IDs provided
        let itemArray = null;
        if (itemIds && Array.isArray(itemIds)) {
            itemArray = itemIds
                .map(id => this.cinema[id])
                .filter(i => i !== undefined);
        } else {
            itemArray = Object.values(this.cinema);
        }

        const index = itemArray.findIndex(i => i.id === itemId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                item,
                window.UniversalContentLightbox.ContentTypes.CURATED_CINEMA,
                itemArray,
                index
            );
        }
    },

    /**
     * Render empty state when no cinema items available
     */
    renderEmptyState() {
        const room = document.getElementById('room');
        if (!room) return;

        // Clear all walls first
        const walls = ['back', 'left', 'right', 'front', 'leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'];
        walls.forEach(wall => {
            const wallContent = document.getElementById(`${wall}-content`);
            if (wallContent) {
                wallContent.innerHTML = '';
            }
        });

        room.className = 'room single-wall-layout';

        const backContent = document.getElementById('back-content');
        if (backContent) {
            backContent.innerHTML = `
                <div class="empty-state">
                    <h2>No Curated Cinema Available</h2>
                    <p>Check back later for film and TV recommendations.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.CuratedCinemaController = CuratedCinemaController;
