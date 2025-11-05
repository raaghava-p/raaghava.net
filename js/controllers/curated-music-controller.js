/**
 * Curated Music Controller
 * Manages display of curated music albums and tracks
 */

const CuratedMusicController = {
    music: null,
    collections: null,

    /**
     * Initialize controller - Load curated music data
     */
    async init() {
        console.log('CuratedMusicController: Initializing');
        await this.loadMusicData();
    },

    /**
     * Load curated music from JSON file
     */
    async loadMusicData() {
        try {
            const response = await fetch('content/curated/music/curated-music.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            this.collections = data.collections || {};

            // Convert items array to object keyed by ID for easy lookup
            this.music = {};
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    this.music[item.id] = item;
                });
            }

            console.log('CuratedMusicController: Loaded', Object.keys(this.music).length, 'music items');
        } catch (error) {
            console.error('CuratedMusicController: Failed to load curated music:', error);
            this.music = {};
            this.collections = {};
        }
    },

    /**
     * Render curated music view
     * @param {string} collectionId - Optional collection ID to filter by
     */
    render(collectionId = null) {
        console.log('CuratedMusicController: Rendering', collectionId || 'overview');

        if (!this.music || Object.keys(this.music).length === 0) {
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
        const itemsInCollection = Object.values(this.music)
            .filter(m => m.collection === collectionId).length;

        return `
            <button class="wall-button" onclick="CuratedMusicController.navigateToCollection('${collectionId}')">
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
            Router.navigateTo(`/works/curated/music/${collectionId}`);
        }
    },

    /**
     * Render a specific collection's music items on the 4 walls
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

        // Get music items in this collection
        const itemsInCollection = Object.values(this.music)
            .filter(m => m.collection === collectionId)
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
                content.innerHTML = this.createMusicButton(item, itemsInCollection);
            }
        });
    },

    /**
     * Create a music item button for the wall
     * @param {Object} item - Music item data
     * @param {Array} itemArray - Array of all music items for navigation
     * @returns {string} HTML string
     */
    createMusicButton(item, itemArray) {
        const featuredBadge = item.featured ? '<span class="featured-badge">Recommended</span>' : '';

        // Build genre badges if genres exist
        let genreBadges = '';
        if (item.genres && Array.isArray(item.genres)) {
            genreBadges = `<div class="track-genres">${item.genres.map(genre =>
                `<span class="genre-badge">${genre}</span>`
            ).join('')}</div>`;
        }

        return `
            <button class="wall-button" onclick='CuratedMusicController.openMusicInLightbox("${item.id}", ${JSON.stringify(itemArray.map(i => i.id))})'>
                <div class="button-content">
                    <h2>${item.title}</h2>
                    ${item.artist ? `<p class="wall-meta">by ${item.artist}</p>` : ''}
                    ${item.year ? `<p class="wall-meta">${item.year}</p>` : ''}
                    ${genreBadges}
                    ${item.excerpt ? `<p class="writing-excerpt">${item.excerpt}</p>` : ''}
                    ${featuredBadge}
                </div>
            </button>
        `;
    },

    /**
     * Open a music item in the lightbox
     * @param {string} itemId - Music item ID to open
     * @param {Array} itemIds - Array of music item IDs for navigation
     */
    openMusicInLightbox(itemId, itemIds = null) {
        const item = this.music[itemId];
        if (!item) {
            console.error('CuratedMusicController: Music item not found:', itemId);
            return;
        }

        // Build navigation array if IDs provided
        let itemArray = null;
        if (itemIds && Array.isArray(itemIds)) {
            itemArray = itemIds
                .map(id => this.music[id])
                .filter(i => i !== undefined);
        } else {
            itemArray = Object.values(this.music);
        }

        const index = itemArray.findIndex(i => i.id === itemId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                item,
                window.UniversalContentLightbox.ContentTypes.CURATED_MUSIC,
                itemArray,
                index
            );
        }
    },

    /**
     * Render empty state when no music items available
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
                    <h2>No Curated Music Available</h2>
                    <p>Check back later for music recommendations.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.CuratedMusicController = CuratedMusicController;
