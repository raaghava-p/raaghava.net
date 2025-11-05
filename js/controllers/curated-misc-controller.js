/**
 * Curated Misc Controller
 * Manages display of miscellaneous curated content (podcasts, videos, tools, etc.)
 */

const CuratedMiscController = {
    items: null,
    collections: null,

    /**
     * Initialize controller - Load curated misc data
     */
    async init() {
        console.log('CuratedMiscController: Initializing');
        await this.loadMiscData();
    },

    /**
     * Load curated misc items from JSON file
     */
    async loadMiscData() {
        try {
            const response = await fetch('content/curated/misc/curated-misc.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            this.collections = data.collections || {};

            // Convert items array to object keyed by ID for easy lookup
            this.items = {};
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    this.items[item.id] = item;
                });
            }

            console.log('CuratedMiscController: Loaded', Object.keys(this.items).length, 'misc items');
        } catch (error) {
            console.error('CuratedMiscController: Failed to load curated misc items:', error);
            this.items = {};
            this.collections = {};
        }
    },

    /**
     * Render curated misc view
     * @param {string} collectionId - Optional collection ID to filter by
     */
    render(collectionId = null) {
        console.log('CuratedMiscController: Rendering', collectionId || 'overview');

        if (!this.items || Object.keys(this.items).length === 0) {
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
        const itemsInCollection = Object.values(this.items)
            .filter(i => i.collection === collectionId).length;

        return `
            <button class="wall-button" onclick="CuratedMiscController.navigateToCollection('${collectionId}')">
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
            Router.navigateTo(`/works/curated/misc/${collectionId}`);
        }
    },

    /**
     * Render a specific collection's items on the 4 walls
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

        // Get items in this collection
        const itemsInCollection = Object.values(this.items)
            .filter(i => i.collection === collectionId)
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
                content.innerHTML = this.createItemButton(item, itemsInCollection);
            }
        });
    },

    /**
     * Create an item button for the wall
     * @param {Object} item - Item data
     * @param {Array} itemArray - Array of all items for navigation
     * @returns {string} HTML string
     */
    createItemButton(item, itemArray) {
        const featuredBadge = item.featured ? '<span class="featured-badge">Recommended</span>' : '';
        const typeBadge = item.type ? `<span class="content-type-badge">${item.type}</span>` : '';

        return `
            <button class="wall-button" onclick='CuratedMiscController.openItemInLightbox("${item.id}", ${JSON.stringify(itemArray.map(i => i.id))})'>
                <div class="button-content">
                    <h2>${item.title}</h2>
                    ${item.creator ? `<p class="wall-meta">by ${item.creator}</p>` : ''}
                    ${typeBadge}
                    ${item.excerpt ? `<p class="writing-excerpt">${item.excerpt}</p>` : ''}
                    ${featuredBadge}
                </div>
            </button>
        `;
    },

    /**
     * Open an item in the lightbox
     * @param {string} itemId - Item ID to open
     * @param {Array} itemIds - Array of item IDs for navigation
     */
    openItemInLightbox(itemId, itemIds = null) {
        const item = this.items[itemId];
        if (!item) {
            console.error('CuratedMiscController: Item not found:', itemId);
            return;
        }

        // Build navigation array if IDs provided
        let itemArray = null;
        if (itemIds && Array.isArray(itemIds)) {
            itemArray = itemIds
                .map(id => this.items[id])
                .filter(i => i !== undefined);
        } else {
            itemArray = Object.values(this.items);
        }

        const index = itemArray.findIndex(i => i.id === itemId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                item,
                window.UniversalContentLightbox.ContentTypes.CURATED_MISC,
                itemArray,
                index
            );
        }
    },

    /**
     * Render empty state when no items available
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
                    <h2>No Curated Content Available</h2>
                    <p>Check back later for curated recommendations.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.CuratedMiscController = CuratedMiscController;
