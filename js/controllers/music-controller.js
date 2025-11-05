/**
 * Music Controller - REDESIGNED
 * 3-wall layout: Collections list | Track grid | Random button
 */

const MusicController = {
    tracks: null,
    collections: null,
    currentCollection: null,
    featuredCollection: null,

    /**
     * Initialize music system
     */
    async init() {
        console.log('MusicController: Initializing');
        await this.loadMusicData();
        this.identifyFeaturedCollection();
    },

    /**
     * Load music data from JSON
     */
    async loadMusicData() {
        try {
            const response = await fetch('content/music/music.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Handle tracks as either object or array
            if (data.tracks) {
                if (Array.isArray(data.tracks)) {
                    // Convert array to object keyed by ID
                    this.tracks = {};
                    data.tracks.forEach(track => {
                        this.tracks[track.id] = track;
                    });
                } else {
                    // Already an object
                    this.tracks = data.tracks;
                }
            } else {
                this.tracks = {};
            }

            this.collections = data.collections || {};

            console.log('MusicController: Loaded', Object.keys(this.tracks).length, 'tracks');
        } catch (error) {
            console.error('MusicController: Failed to load data:', error);
            this.tracks = {};
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
     * Render music page with 3-wall layout
     */
    render() {
        console.log('MusicController: Rendering');

        if (!this.tracks || Object.keys(this.tracks).length === 0) {
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
        const collectionButtons = collectionIds.map(id => {
            const collection = this.collections[id];
            const isActive = id === this.currentCollection ? 'active' : '';
            return `
                <button class="collection-text-button ${isActive}" onclick="MusicController.selectCollection('${id}')">
                    ${collection.name}
                </button>
            `;
        }).join('');

        leftContent.innerHTML = `
            <div class="wall-content">
                <div class="collection-list">
                    ${collectionButtons}
                </div>
            </div>
        `;
    },

    /**
     * Render CENTER WALL - Track grid
     */
    renderCenterWall() {
        const backContent = document.getElementById('back-content');
        if (!backContent) return;

        const collection = this.collections[this.currentCollection];
        if (!collection) return;

        // Get tracks in this collection (limit to 6 for grid)
        const tracksInCollection = Object.values(this.tracks)
            .filter(t => t.collection === this.currentCollection);

        const displayTracks = tracksInCollection.slice(0, 6);

        const trackGrid = displayTracks.map(track => {
            const coverUrl = track.coverArt || 'content/music/default-cover.webp';
            return `
                <div class="track-grid-item" onclick='MusicController.openTrackInLightbox("${track.id}")'>
                    <div class="track-thumbnail" style="background-image: url('${coverUrl}')"></div>
                </div>
            `;
        }).join('');

        backContent.innerHTML = `
            <div class="wall-content">
                <h2 class="collection-title">${collection.name}</h2>
                <div class="track-grid-2x3">
                    ${trackGrid}
                </div>
                <button class="more-label bottom-right" onclick="MusicController.openCollectionGrid()">
                    more
                </button>
            </div>
        `;
    },

    /**
     * Render RIGHT WALL - Random button
     */
    renderRightWall() {
        const rightContent = document.getElementById('right-content');
        if (!rightContent) return;

        rightContent.innerHTML = `
            <div class="wall-content">
                <button class="wall-button random-button" onclick="MusicController.openRandomTrack()">
                    <h3>Random</h3>
                </button>
            </div>
        `;
    },

    /**
     * Select a collection
     * @param {string} collectionId - Collection to select
     */
    selectCollection(collectionId) {
        console.log('MusicController: Selecting collection:', collectionId);
        this.currentCollection = collectionId;
        this.renderCenterWall();
        this.renderLeftWall(); // Re-render to update active state
    },

    /**
     * Open collection grid lightbox (shows all tracks from collection)
     */
    openCollectionGrid() {
        const tracksInCollection = Object.values(this.tracks)
            .filter(t => t.collection === this.currentCollection);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.openGrid(
                tracksInCollection,
                'music',
                this.collections[this.currentCollection].name
            );
        }
    },

    /**
     * Open track in lightbox
     * @param {string} trackId - Track ID to open
     */
    openTrackInLightbox(trackId) {
        const track = this.tracks[trackId];
        if (!track) {
            console.error('MusicController: Track not found:', trackId);
            return;
        }

        // Get all tracks in current collection for navigation
        const tracksInCollection = Object.values(this.tracks)
            .filter(t => t.collection === this.currentCollection);

        const index = tracksInCollection.findIndex(t => t.id === trackId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                track,
                window.UniversalContentLightbox.ContentTypes.MUSIC,
                tracksInCollection,
                index
            );
        }
    },

    /**
     * Open random track from any collection
     */
    openRandomTrack() {
        const allTracks = Object.values(this.tracks);
        if (allTracks.length === 0) return;

        const randomIndex = Math.floor(Math.random() * allTracks.length);
        const randomTrack = allTracks[randomIndex];

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                randomTrack,
                window.UniversalContentLightbox.ContentTypes.MUSIC,
                [randomTrack], // Single track, no navigation
                0
            );
        }
    },

    /**
     * Render empty state when no tracks available
     */
    renderEmptyState() {
        const room = document.getElementById('room');
        if (!room) return;

        room.className = 'room single-wall-layout';

        const backContent = document.getElementById('back-content');
        if (backContent) {
            backContent.innerHTML = `
                <div class="empty-state">
                    <h2>No Music Available</h2>
                    <p>Check back later for music tracks.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.MusicController = MusicController;
