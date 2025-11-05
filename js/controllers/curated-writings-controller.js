/**
 * Curated Writings Controller
 * Manages display of curated external writings (books, articles, essays)
 */

const CuratedWritingsController = {
    writings: null,
    collections: null,

    /**
     * Initialize controller - Load curated writings data
     */
    async init() {
        console.log('CuratedWritingsController: Initializing');
        await this.loadWritingsData();
    },

    /**
     * Load curated writings from JSON file
     */
    async loadWritingsData() {
        try {
            const response = await fetch('content/curated/writings/curated-writings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            this.collections = data.collections || {};

            // Convert articles array to object keyed by ID for easy lookup
            this.writings = {};
            if (data.articles && Array.isArray(data.articles)) {
                data.articles.forEach(article => {
                    this.writings[article.id] = article;
                });
            }

            console.log('CuratedWritingsController: Loaded', Object.keys(this.writings).length, 'curated writings');
        } catch (error) {
            console.error('CuratedWritingsController: Failed to load curated writings:', error);
            this.writings = {};
            this.collections = {};
        }
    },

    /**
     * Render curated writings view
     * @param {string} collectionId - Optional collection ID to filter by
     */
    render(collectionId = null) {
        console.log('CuratedWritingsController: Rendering', collectionId || 'overview');

        if (!this.writings || Object.keys(this.writings).length === 0) {
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
        const writingsInCollection = Object.values(this.writings)
            .filter(w => w.collection === collectionId).length;

        return `
            <button class="wall-button" onclick="CuratedWritingsController.navigateToCollection('${collectionId}')">
                <div class="button-content">
                    <h2>${collection.name}</h2>
                    <p class="wall-description">${collection.description}</p>
                    <p class="wall-meta">${writingsInCollection} ${writingsInCollection === 1 ? 'item' : 'items'}</p>
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
            Router.navigateTo(`/works/curated/writings/${collectionId}`);
        }
    },

    /**
     * Render a specific collection's writings on the 4 walls
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

        // Get writings in this collection
        const writingsInCollection = Object.values(this.writings)
            .filter(w => w.collection === collectionId)
            .sort((a, b) => {
                // Sort by featured first, then by date added
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.dateAdded) - new Date(a.dateAdded);
            });

        const walls = ['leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'];

        writingsInCollection.forEach((writing, index) => {
            if (index >= walls.length) return;

            const content = document.getElementById(`${walls[index]}-content`);
            if (content) {
                content.innerHTML = this.createWritingButton(writing, writingsInCollection);
            }
        });
    },

    /**
     * Create a writing button for the wall
     * @param {Object} writing - Writing data
     * @param {Array} writingArray - Array of all writings for navigation
     * @returns {string} HTML string
     */
    createWritingButton(writing, writingArray) {
        const featuredBadge = writing.featured ? '<span class="featured-badge">Recommended</span>' : '';

        return `
            <button class="wall-button" onclick='CuratedWritingsController.openWritingInLightbox("${writing.id}", ${JSON.stringify(writingArray.map(w => w.id))})'>
                <div class="button-content">
                    <h2>${writing.title}</h2>
                    ${writing.author ? `<p class="wall-meta">by ${writing.author}</p>` : ''}
                    ${writing.excerpt ? `<p class="writing-excerpt">${writing.excerpt}</p>` : ''}
                    ${featuredBadge}
                    ${writing.type ? `<p class="wall-meta">${writing.type}</p>` : ''}
                </div>
            </button>
        `;
    },

    /**
     * Open a writing in the lightbox
     * @param {string} writingId - Writing ID to open
     * @param {Array} writingIds - Array of writing IDs for navigation
     */
    openWritingInLightbox(writingId, writingIds = null) {
        const writing = this.writings[writingId];
        if (!writing) {
            console.error('CuratedWritingsController: Writing not found:', writingId);
            return;
        }

        // Build navigation array if IDs provided
        let writingArray = null;
        if (writingIds && Array.isArray(writingIds)) {
            writingArray = writingIds
                .map(id => this.writings[id])
                .filter(w => w !== undefined);
        } else {
            writingArray = Object.values(this.writings);
        }

        const index = writingArray.findIndex(w => w.id === writingId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                writing,
                window.UniversalContentLightbox.ContentTypes.CURATED_WRITING,
                writingArray,
                index
            );
        }
    },

    /**
     * Render empty state when no writings available
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
                    <h2>No Curated Writings Available</h2>
                    <p>Check back later for curated reading recommendations.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.CuratedWritingsController = CuratedWritingsController;
