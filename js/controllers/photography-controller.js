/**
 * Photography Controller - REDESIGNED
 * 3-wall layout: Collections list | Photo grid | Random button
 */

const PhotographyController = {
    photos: null,
    collections: null,
    currentCollection: null,
    featuredCollection: null,

    /**
     * Initialize photography system
     */
    async init() {
        console.log('PhotographyController: Initializing');
        await this.loadPhotographyData();
        this.identifyFeaturedCollection();
    },

    /**
     * Load photography data from JSON
     */
    async loadPhotographyData() {
        try {
            const response = await fetch('content/photography/photography.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Handle photos as either object or array
            if (data.photos) {
                if (Array.isArray(data.photos)) {
                    // Convert array to object keyed by ID
                    this.photos = {};
                    data.photos.forEach(photo => {
                        this.photos[photo.id] = photo;
                    });
                } else {
                    // Already an object
                    this.photos = data.photos;
                }
            } else {
                this.photos = {};
            }

            this.collections = data.collections || {};

            console.log('PhotographyController: Loaded', Object.keys(this.photos).length, 'photos');
        } catch (error) {
            console.error('PhotographyController: Failed to load data:', error);
            this.photos = {};
            this.collections = {};
        }
    },

    /**
     * Identify featured collection
     */
    identifyFeaturedCollection() {
        for (const [id, collection] of Object.entries(this.collections)) {
            if (collection.featured) {
                this.featuredCollection = id;
                break;
            }
        }
        // Fallback to first collection if none featured
        if (!this.featuredCollection && Object.keys(this.collections).length > 0) {
            this.featuredCollection = Object.keys(this.collections)[0];
        }
    },

    /**
     * Render photography page with 3-wall layout
     */
    render() {
        console.log('PhotographyController: Rendering');

        if (!this.photos || Object.keys(this.photos).length === 0) {
            this.renderEmptyState();
            return;
        }

        const room = document.getElementById('room');
        if (!room) return;

        // Use 3-wall layout
        room.className = 'room three-wall-layout';

        // Clear all walls
        this.clearAllWalls();

        // Default to featured collection
        this.currentCollection = this.featuredCollection;

        // Render each wall
        this.renderLeftWall();
        this.renderCenterWall();
        this.renderRightWall();
    },

    /**
     * Clear all wall content
     */
    clearAllWalls() {
        ['left', 'back', 'right'].forEach(wall => {
            const content = document.getElementById(`${wall}-content`);
            if (content) content.innerHTML = '';
        });
    },

    /**
     * Render LEFT WALL - Collection list
     */
    renderLeftWall() {
        const leftContent = document.getElementById('left-content');
        if (!leftContent) return;

        const collectionIds = Object.keys(this.collections);
        const collectionLinks = collectionIds.map(id => {
            const collection = this.collections[id];
            const isActive = id === this.currentCollection ? 'active' : '';
            return `
                <a href="#" class="collection-link ${isActive}" onclick="event.preventDefault(); PhotographyController.selectCollection('${id}');">
                    ${collection.name}
                </a>
            `;
        }).join('');

        leftContent.innerHTML = `
            <div class="wall-content">
                <h3 class="wall-heading">Collections</h3>
                <div class="collection-list">
                    ${collectionLinks}
                </div>
            </div>
        `;
    },

    /**
     * Render CENTER WALL - Photo grid
     */
    renderCenterWall() {
        const backContent = document.getElementById('back-content');
        if (!backContent) return;

        const collection = this.collections[this.currentCollection];
        if (!collection) return;

        // Get photos in this collection (limit to 6 for grid)
        const photosInCollection = Object.values(this.photos)
            .filter(p => p.collection === this.currentCollection);

        console.log('PhotographyController: Photos in collection:', photosInCollection.length);
        console.log('PhotographyController: Current collection:', this.currentCollection);

        const displayPhotos = photosInCollection.slice(0, 6);

        const photoGrid = displayPhotos.map(photo => {
            const parts = photo.filename ? photo.filename.split('.') : [];
            const basename = parts.length >= 2 ? parts.slice(0, -1).join('.') : photo.filename || 'placeholder';
            const extension = parts.length >= 2 ? parts[parts.length - 1] : 'webp';
            const thumbnailUrl = `content/photography/${basename}_thumbnail.${extension}`;

            console.log('PhotographyController: Photo:', photo.id, 'Filename:', photo.filename, 'Thumbnail URL:', thumbnailUrl);
            return `
                <div class="main-photo-card" onclick='PhotographyController.openPhotoInLightbox("${photo.id}")'>
                    <img src="${thumbnailUrl}" alt="${photo.title || 'Photo'}" class="main-photo-img">
                </div>
            `;
        }).join('');

        const html = `
            <div class="wall-content">
                <h2 class="collection-title">${collection.name}</h2>
                <div class="main-photo-grid">
                    ${photoGrid}
                </div>
                <button class="more-label bottom-left" onclick="PhotographyController.openCollectionGrid()">
                    more
                </button>
            </div>
        `;

        console.log('PhotographyController: Setting backContent HTML, length:', html.length);
        console.log('PhotographyController: photoGrid items:', displayPhotos.length);
        backContent.innerHTML = html;

        // Verify it's in the DOM
        setTimeout(() => {
            const gridInDom = document.querySelector('.main-photo-grid');
            console.log('PhotographyController: Grid in DOM:', gridInDom);
            if (gridInDom) {
                console.log('PhotographyController: Grid computed style:', window.getComputedStyle(gridInDom).display);
                console.log('PhotographyController: Grid columns:', window.getComputedStyle(gridInDom).gridTemplateColumns);
            }
        }, 100);
    },

    /**
     * Render RIGHT WALL - Random button
     */
    renderRightWall() {
        const rightContent = document.getElementById('right-content');
        if (!rightContent) return;

        rightContent.innerHTML = `
            <div class="wall-content">
                <a href="#" class="random-link" onclick="PhotographyController.openRandomPhoto(); return false;">Random</a>
            </div>
        `;
    },

    /**
     * Select a collection
     * @param {string} collectionId - Collection to select
     */
    selectCollection(collectionId) {
        console.log('PhotographyController: Selecting collection:', collectionId);
        console.log('PhotographyController: Previous collection:', this.currentCollection);
        this.currentCollection = collectionId;
        console.log('PhotographyController: New collection:', this.currentCollection);
        this.renderCenterWall();
        this.renderLeftWall(); // Re-render to update active state
    },

    /**
     * Get thumbnail URL from photo filename
     * @param {string} filename - Original filename
     * @returns {string} Thumbnail URL
     */
    getThumbnailUrl(filename) {
        if (!filename) return '';

        // Handle filename with or without extension
        const parts = filename.split('.');
        let basename, extension;

        if (parts.length >= 2) {
            // Has extension
            extension = parts.pop();
            basename = parts.join('.');
        } else {
            // No extension, assume .webp
            basename = filename;
            extension = 'webp';
        }

        return `content/photography/${basename}_thumbnail.${extension}`;
    },

    /**
     * Open collection grid lightbox (shows all photos from collection)
     */
    openCollectionGrid() {
        const photosInCollection = Object.values(this.photos)
            .filter(p => p.collection === this.currentCollection);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.openGrid(
                photosInCollection,
                'photo',
                this.collections[this.currentCollection].name
            );
        }
    },

    /**
     * Open photo in lightbox
     * @param {string} photoId - Photo ID to open
     */
    openPhotoInLightbox(photoId) {
        const photo = this.photos[photoId];
        if (!photo) {
            console.error('PhotographyController: Photo not found:', photoId);
            return;
        }

        // Get all photos in current collection for navigation
        const photosInCollection = Object.values(this.photos)
            .filter(p => p.collection === this.currentCollection);

        const index = photosInCollection.findIndex(p => p.id === photoId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                photo,
                window.UniversalContentLightbox.ContentTypes.PHOTO,
                photosInCollection,
                index
            );
        }
    },

    /**
     * Open random photo from any collection
     */
    openRandomPhoto() {
        const allPhotos = Object.values(this.photos);
        if (allPhotos.length === 0) return;

        const randomIndex = Math.floor(Math.random() * allPhotos.length);
        const randomPhoto = allPhotos[randomIndex];

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                randomPhoto,
                window.UniversalContentLightbox.ContentTypes.PHOTO,
                [randomPhoto], // Single photo, no navigation
                0
            );
        }
    },

    /**
     * Render empty state when no photos available
     */
    renderEmptyState() {
        const room = document.getElementById('room');
        if (!room) return;

        room.className = 'room single-wall-layout';

        const backContent = document.getElementById('back-content');
        if (backContent) {
            backContent.innerHTML = `
                <div class="empty-state">
                    <h2>No Photos Available</h2>
                    <p>Check back later for photography.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.PhotographyController = PhotographyController;
