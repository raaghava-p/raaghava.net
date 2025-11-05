/**
 * Universal Content Lightbox System
 * Adaptive lightbox that handles all content types with optimized layouts
 * Supports: photos, writings, music, projects, and all curated content
 */

const UniversalContentLightbox = {
    // Lightbox state
    isOpen: false,
    currentContent: null,
    currentType: null,
    currentIndex: 0,
    contentArray: null,

    // Content type constants
    ContentTypes: {
        PHOTO: 'photo',
        WRITING: 'writing',
        MUSIC: 'music',
        PROJECT: 'project',
        CURATED_WRITING: 'curated_writing',
        CURATED_CINEMA: 'curated_cinema',
        CURATED_MUSIC: 'curated_music',
        CURATED_MISC: 'curated_misc'
    },

    // DOM elements cache
    elements: {
        lightbox: null,
        backdrop: null,
        container: null,
        content: null
    },

    /**
     * Initialize the lightbox system
     */
    init() {
        console.log('Lightbox: Initializing universal lightbox system');

        // Create lightbox DOM structure
        this.createLightboxElement();

        // Cache DOM elements
        this.cacheElements();

        // Setup event listeners
        this.setupEventListeners();

        console.log('Lightbox: Initialization complete');
    },

    /**
     * Create lightbox DOM element and inject into page
     */
    createLightboxElement() {
        const lightboxHTML = `
            <div id="universal-lightbox" class="universal-lightbox hidden" role="dialog" aria-modal="true" aria-label="Content viewer">
                <div class="lightbox-backdrop" data-intensity="medium">
                    <div class="lightbox-container">
                        <button class="lightbox-close" aria-label="Close lightbox (Esc)">×</button>
                        <div class="lightbox-content-wrapper">
                            <!-- Dynamic content renders here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    },

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements.lightbox = document.getElementById('universal-lightbox');
        this.elements.backdrop = this.elements.lightbox?.querySelector('.lightbox-backdrop');
        this.elements.container = this.elements.lightbox?.querySelector('.lightbox-container');
        this.elements.content = this.elements.lightbox?.querySelector('.lightbox-content-wrapper');
    },

    /**
     * Setup event listeners for lightbox interactions
     */
    setupEventListeners() {
        // Close button
        const closeBtn = this.elements.lightbox?.querySelector('.lightbox-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Click backdrop to close
        if (this.elements.backdrop) {
            this.elements.backdrop.addEventListener('click', (event) => {
                if (event.target === this.elements.backdrop) {
                    this.close();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (event) => this.handleKeyboard(event));
    },

    /**
     * Handle keyboard events for navigation and control
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboard(event) {
        if (!this.isOpen) return;

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                break;

            case 'ArrowLeft':
                event.preventDefault();
                this.navigatePrevious();
                break;

            case 'ArrowRight':
                event.preventDefault();
                this.navigateNext();
                break;
        }
    },

    /**
     * Open lightbox with content
     * @param {Object} content - Content object to display
     * @param {string} type - Content type (from ContentTypes)
     * @param {Array} contentArray - Optional array of content for navigation
     * @param {number} index - Optional starting index in content array
     */
    open(content, type, contentArray = null, index = 0) {
        if (!content || !type) {
            console.error('Lightbox: Cannot open without content and type');
            return;
        }

        console.log(`Lightbox: Opening with type "${type}"`, content);

        // Store state
        this.currentContent = content;
        this.currentType = type;
        this.contentArray = contentArray;
        this.currentIndex = index;

        // Set backdrop intensity based on content type
        this.setBackdropIntensity(type);

        // Render content
        this.renderLightbox(content, type);

        // Show lightbox
        this.show();
    },

    /**
     * Render lightbox content based on type
     * @param {Object} content - Content to render
     * @param {string} type - Content type
     */
    renderLightbox(content, type) {
        if (!this.elements.content) return;

        // Add type class to lightbox
        this.elements.lightbox.className = `universal-lightbox lightbox-${type}`;

        // Render appropriate content based on type
        let contentHTML = '';

        switch (type) {
            case this.ContentTypes.PHOTO:
                contentHTML = this.renderPhotoContent(content);
                break;

            case this.ContentTypes.WRITING:
                contentHTML = this.renderWritingContent(content);
                break;

            case this.ContentTypes.MUSIC:
                contentHTML = this.renderMusicContent(content);
                break;

            case this.ContentTypes.PROJECT:
                contentHTML = this.renderProjectContent(content);
                break;

            case this.ContentTypes.CURATED_WRITING:
            case this.ContentTypes.CURATED_CINEMA:
            case this.ContentTypes.CURATED_MUSIC:
            case this.ContentTypes.CURATED_MISC:
                contentHTML = this.renderCuratedContent(content, type);
                break;

            default:
                contentHTML = this.renderGenericContent(content);
        }

        this.elements.content.innerHTML = contentHTML;

        // Setup content-specific interactions
        this.setupContentInteractions(type);
    },

    /**
     * Render photo content
     * @param {Object} photo - Photo object
     * @returns {string} HTML string
     */
    renderPhotoContent(photo) {
        const navigation = this.contentArray ? this.renderNavigationControls() : '';

        // Check if filename is already a full URL or data URI
        const isFullUrl = photo.filename.startsWith('http') || photo.filename.startsWith('data:');
        const imageSrc = isFullUrl ? photo.filename : `content/photography/${photo.filename}.png`;
        const imageWebP = isFullUrl ? null : `content/photography/${photo.filename}.webp`;

        return `
            <div class="lightbox-photo-display">
                <div class="photo-main">
                    <picture class="lightbox-image">
                        ${imageWebP ? `<source srcset="${imageWebP}" type="image/webp">` : ''}
                        <img src="${imageSrc}"
                             alt="${photo.title || 'Photo'}"
                             loading="eager">
                    </picture>
                </div>
                <div class="photo-info">
                    <h2 class="photo-title">${photo.title || 'Untitled'}</h2>
                    ${photo.description ? `<p class="photo-description">${photo.description}</p>` : ''}

                    <div class="photo-metadata">
                        ${photo.location ? `
                            <div class="meta-row">
                                <span class="meta-label">Location:</span>
                                <span class="meta-value">${photo.location}</span>
                            </div>
                        ` : ''}
                        ${photo.date ? `
                            <div class="meta-row">
                                <span class="meta-label">Date:</span>
                                <span class="meta-value">${photo.date}</span>
                            </div>
                        ` : ''}
                        ${photo.camera ? `
                            <div class="meta-row">
                                <span class="meta-label">Camera:</span>
                                <span class="meta-value">${photo.camera}</span>
                            </div>
                        ` : ''}
                        ${photo.settings ? `
                            <div class="meta-row">
                                <span class="meta-label">Settings:</span>
                                <span class="meta-value">
                                    ${photo.settings.aperture || ''}
                                    ${photo.settings.shutter || ''}
                                    ${photo.settings.iso ? 'ISO ' + photo.settings.iso : ''}
                                    ${photo.settings.focal_length || ''}
                                </span>
                            </div>
                        ` : ''}
                    </div>

                    ${photo.tags && photo.tags.length > 0 ? `
                        <div class="photo-tags">
                            ${photo.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                ${navigation}
            </div>
        `;
    },

    /**
     * Render writing content
     * @param {Object} writing - Writing object
     * @returns {string} HTML string
     */
    renderWritingContent(writing) {
        return `
            <div class="lightbox-writing-display">
                <header class="writing-header">
                    <h1 class="writing-title">${writing.title || 'Untitled'}</h1>
                    ${writing.subtitle ? `<h2 class="writing-subtitle">${writing.subtitle}</h2>` : ''}

                    <div class="writing-meta">
                        ${writing.datePublished ? `<span class="date">${this.formatDate(writing.datePublished)}</span>` : ''}
                        ${writing.readingTime ? `<span class="reading-time">${writing.readingTime} min read</span>` : ''}
                        ${writing.wordCount ? `<span class="word-count">${writing.wordCount} words</span>` : ''}
                    </div>
                </header>

                <article class="writing-content">
                    ${writing.content || writing.description || '<p>Content not available</p>'}
                </article>

                ${writing.tags && writing.tags.length > 0 ? `
                    <footer class="writing-footer">
                        <div class="writing-tags">
                            ${writing.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </footer>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render music content with player controls
     * @param {Object} track - Music track object
     * @returns {string} HTML string
     */
    renderMusicContent(track) {
        // Check if cover is already a full URL or data URI
        const isFullUrl = track.cover && (track.cover.startsWith('http') || track.cover.startsWith('data:'));
        const coverSrc = track.cover ? (isFullUrl ? track.cover : `content/music/${track.cover}`) : null;

        // Check if audio filename is a URL or data URI
        const audioIsFullUrl = track.filename && (track.filename.startsWith('http') || track.filename.startsWith('data:'));
        const audioSrc = track.filename ? (audioIsFullUrl ? track.filename : `content/music/${track.filename}`) : null;

        const navigation = this.contentArray ? this.renderNavigationControls() : '';

        return `
            <div class="lightbox-music-display">
                <div class="music-visual">
                    ${coverSrc ? `
                        <img src="${coverSrc}"
                             alt="${track.title} cover"
                             class="album-cover">
                    ` : `<div class="album-cover-placeholder">♪</div>`}
                </div>

                <div class="music-info">
                    <h2 class="track-title">${track.title || 'Untitled Track'}</h2>
                    ${track.description ? `<p class="track-description">${track.description}</p>` : ''}

                    <div class="track-metadata">
                        ${track.duration ? `
                            <div class="meta-item">
                                <span class="meta-label">Duration:</span>
                                <span class="meta-value">${this.formatDuration(track.duration)}</span>
                            </div>
                        ` : ''}
                        ${track.key ? `
                            <div class="meta-item">
                                <span class="meta-label">Key:</span>
                                <span class="meta-value">${track.key}</span>
                            </div>
                        ` : ''}
                        ${track.bpm ? `
                            <div class="meta-item">
                                <span class="meta-label">BPM:</span>
                                <span class="meta-value">${track.bpm}</span>
                            </div>
                        ` : ''}
                        ${track.instruments && track.instruments.length > 0 ? `
                            <div class="meta-item">
                                <span class="meta-label">Instruments:</span>
                                <span class="meta-value">${track.instruments.join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>

                    ${track.genre && track.genre.length > 0 ? `
                        <div class="music-genres">
                            ${track.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>

                ${audioSrc ? `
                    <div class="music-player">
                        <audio controls class="audio-player" src="${audioSrc}">
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                ` : ''}

                ${navigation}
            </div>
        `;
    },

    /**
     * Render project content
     * @param {Object} project - Project object
     * @returns {string} HTML string
     */
    renderProjectContent(project) {
        // Check if hero image is already a full URL or data URI
        const heroImage = project.images && project.images.hero;
        const isFullUrl = heroImage && (heroImage.startsWith('http') || heroImage.startsWith('data:'));
        const heroSrc = heroImage ? (isFullUrl ? heroImage : `content/projects/${heroImage}`) : null;

        return `
            <div class="lightbox-project-display">
                ${heroSrc ? `
                    <div class="project-hero">
                        <img src="${heroSrc}"
                             alt="${project.title}"
                             class="hero-image">
                    </div>
                ` : ''}

                <div class="project-info">
                    <h2 class="project-title">${project.title || 'Untitled Project'}</h2>
                    ${project.description ? `<p class="project-description">${project.description}</p>` : ''}

                    ${project.status ? `
                        <div class="project-status">
                            <span class="status-badge status-${project.status}">${project.status}</span>
                            ${project.dateStarted ? `
                                <span class="project-timeline">
                                    ${this.formatDate(project.dateStarted)} -
                                    ${project.dateCompleted ? this.formatDate(project.dateCompleted) : 'Ongoing'}
                                </span>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${project.longDescription ? `
                        <div class="project-details">
                            <h3>Overview</h3>
                            <p>${project.longDescription}</p>
                        </div>
                    ` : ''}

                    ${project.features && project.features.length > 0 ? `
                        <div class="project-features">
                            <h3>Key Features</h3>
                            <ul>
                                ${project.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${project.technologies && project.technologies.length > 0 ? `
                        <div class="project-tech">
                            <h3>Technologies</h3>
                            <div class="tech-stack">
                                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${project.links ? `
                        <div class="project-links">
                            ${project.links.live ? `
                                <a href="${project.links.live}" target="_blank" rel="noopener" class="project-link live">
                                    View Live Project →
                                </a>
                            ` : ''}
                            ${project.links.github ? `
                                <a href="${project.links.github}" target="_blank" rel="noopener" class="project-link github">
                                    View on GitHub →
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render curated content (books, movies, music, misc)
     * @param {Object} item - Curated content object
     * @param {string} type - Specific curated type
     * @returns {string} HTML string
     */
    renderCuratedContent(item, type) {
        const typeLabels = {
            curated_writing: 'Book/Article',
            curated_cinema: 'Film/TV',
            curated_music: 'Album/Music',
            curated_misc: 'Item'
        };

        // Check if cover is already a full URL or data URI
        const isFullUrl = item.cover && (item.cover.startsWith('http') || item.cover.startsWith('data:'));
        const coverSrc = item.cover ? (isFullUrl ? item.cover : `content/curated/${item.cover}`) : null;

        return `
            <div class="lightbox-curated-display">
                ${coverSrc ? `
                    <div class="curated-visual">
                        <img src="${coverSrc}"
                             alt="${item.title}"
                             class="curated-cover">
                    </div>
                ` : ''}

                <div class="curated-info">
                    <div class="curated-header">
                        <span class="content-type-badge">${typeLabels[type] || 'Curated'}</span>
                        <h2 class="curated-title">${item.title || 'Untitled'}</h2>
                        ${item.creator ? `<h3 class="curated-creator">by ${item.creator}</h3>` : ''}
                    </div>

                    ${item.rating ? `
                        <div class="curated-rating">
                            <span class="rating-label">Rating:</span>
                            <span class="rating-stars">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</span>
                        </div>
                    ` : ''}

                    ${item.summary ? `
                        <div class="curated-summary">
                            <h4>Summary</h4>
                            <p>${item.summary}</p>
                        </div>
                    ` : ''}

                    ${item.review ? `
                        <div class="curated-review">
                            <h4>My Review</h4>
                            <p>${item.review}</p>
                        </div>
                    ` : ''}

                    ${this.renderCuratedMetadata(item, type)}

                    ${item.genre && item.genre.length > 0 ? `
                        <div class="curated-genres">
                            ${item.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                        </div>
                    ` : ''}

                    ${item.externalLinks && item.externalLinks.primary ? `
                        <div class="curated-links">
                            <a href="${item.externalLinks.primary}" target="_blank" rel="noopener" class="external-link">
                                View External Source →
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render type-specific metadata for curated content
     * @param {Object} item - Curated item
     * @param {string} type - Content type
     * @returns {string} HTML string
     */
    renderCuratedMetadata(item, type) {
        if (!item.metadata) return '';

        const meta = item.metadata;
        let metadataHTML = '<div class="curated-metadata">';

        // Type-specific metadata
        if (type === this.ContentTypes.CURATED_WRITING) {
            if (meta.pages) metadataHTML += `<div class="meta-item">Pages: ${meta.pages}</div>`;
            if (meta.publisher) metadataHTML += `<div class="meta-item">Publisher: ${meta.publisher}</div>`;
            if (item.year) metadataHTML += `<div class="meta-item">Published: ${item.year}</div>`;
        } else if (type === this.ContentTypes.CURATED_CINEMA) {
            if (meta.director) metadataHTML += `<div class="meta-item">Director: ${Array.isArray(meta.director) ? meta.director.join(', ') : meta.director}</div>`;
            if (meta.duration) metadataHTML += `<div class="meta-item">Runtime: ${this.formatDuration(meta.duration)}</div>`;
            if (item.year) metadataHTML += `<div class="meta-item">Year: ${item.year}</div>`;
        } else if (type === this.ContentTypes.CURATED_MUSIC) {
            if (meta.label) metadataHTML += `<div class="meta-item">Label: ${meta.label}</div>`;
            if (meta.tracks) metadataHTML += `<div class="meta-item">Tracks: ${meta.tracks}</div>`;
            if (item.year) metadataHTML += `<div class="meta-item">Released: ${item.year}</div>`;
        }

        metadataHTML += '</div>';
        return metadataHTML;
    },

    /**
     * Render generic fallback content
     * @param {Object} content - Content object
     * @returns {string} HTML string
     */
    renderGenericContent(content) {
        return `
            <div class="lightbox-generic-display">
                <h2>${content.title || 'Content'}</h2>
                ${content.description ? `<p>${content.description}</p>` : ''}
                <pre>${JSON.stringify(content, null, 2)}</pre>
            </div>
        `;
    },

    /**
     * Render navigation controls for galleries
     * @returns {string} HTML string
     */
    renderNavigationControls() {
        if (!this.contentArray || this.contentArray.length <= 1) return '';

        const hasPrevious = this.currentIndex > 0;
        const hasNext = this.currentIndex < this.contentArray.length - 1;

        return `
            <div class="lightbox-navigation">
                <button class="nav-btn nav-previous"
                        ${!hasPrevious ? 'disabled' : ''}
                        aria-label="Previous item">
                    ← Previous
                </button>
                <span class="nav-counter">
                    ${this.currentIndex + 1} / ${this.contentArray.length}
                </span>
                <button class="nav-btn nav-next"
                        ${!hasNext ? 'disabled' : ''}
                        aria-label="Next item">
                    Next →
                </button>
            </div>
        `;
    },

    /**
     * Setup content-specific interactions after render
     * @param {string} type - Content type
     */
    setupContentInteractions(type) {
        // Setup navigation button listeners
        const prevBtn = this.elements.content?.querySelector('.nav-previous');
        const nextBtn = this.elements.content?.querySelector('.nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePrevious());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNext());
        }

        // Type-specific interactions
        if (type === this.ContentTypes.MUSIC) {
            // Audio player is native HTML5 - no additional setup needed
        }
    },

    /**
     * Navigate to previous item in content array
     */
    navigatePrevious() {
        if (!this.contentArray || this.currentIndex <= 0) return;

        this.currentIndex--;
        const newContent = this.contentArray[this.currentIndex];
        this.renderLightbox(newContent, this.currentType);
    },

    /**
     * Navigate to next item in content array
     */
    navigateNext() {
        if (!this.contentArray || this.currentIndex >= this.contentArray.length - 1) return;

        this.currentIndex++;
        const newContent = this.contentArray[this.currentIndex];
        this.renderLightbox(newContent, this.currentType);
    },

    /**
     * Set backdrop intensity based on content type
     * @param {string} type - Content type
     */
    setBackdropIntensity(type) {
        if (!this.elements.backdrop) return;

        const intensities = {
            [this.ContentTypes.PHOTO]: 'high',
            [this.ContentTypes.WRITING]: 'medium',
            [this.ContentTypes.MUSIC]: 'low',
            [this.ContentTypes.PROJECT]: 'medium',
            [this.ContentTypes.CURATED_WRITING]: 'medium',
            [this.ContentTypes.CURATED_CINEMA]: 'high',
            [this.ContentTypes.CURATED_MUSIC]: 'low',
            [this.ContentTypes.CURATED_MISC]: 'medium'
        };

        const intensity = intensities[type] || 'medium';
        this.elements.backdrop.setAttribute('data-intensity', intensity);
    },

    /**
     * Show the lightbox
     */
    show() {
        if (!this.elements.lightbox) return;

        this.elements.lightbox.classList.remove('hidden');
        this.elements.lightbox.classList.add('entering');
        this.isOpen = true;

        // Focus management for accessibility
        setTimeout(() => {
            this.elements.lightbox.classList.remove('entering');
            const closeBtn = this.elements.lightbox.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus();
        }, 50);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close the lightbox
     */
    close() {
        if (!this.elements.lightbox || !this.isOpen) return;

        this.elements.lightbox.classList.add('exiting');

        setTimeout(() => {
            this.elements.lightbox.classList.remove('exiting');
            this.elements.lightbox.classList.add('hidden');
            this.isOpen = false;

            // Clear content
            if (this.elements.content) {
                this.elements.content.innerHTML = '';
            }

            // Reset state
            this.currentContent = null;
            this.currentType = null;
            this.contentArray = null;
            this.currentIndex = 0;

            // Restore body scroll
            document.body.style.overflow = '';
        }, 200);
    },

    /**
     * Utility: Format date string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Utility: Format duration in seconds to readable string
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `0:${secs.toString().padStart(2, '0')}`;
        }
    },

    /**
     * Open lightbox in grid/list view mode
     * Shows scrollable collection of items that can be clicked to view individually
     * @param {Array} items - Array of content items
     * @param {string} type - Content type
     * @param {string} title - Grid title
     */
    openGrid(items, type, title) {
        if (!items || items.length === 0) {
            console.error('Lightbox: Cannot open grid without items');
            return;
        }

        console.log(`Lightbox: Opening grid view with ${items.length} items`);

        // Store state for grid mode
        this.isGridMode = true;
        this.gridItems = items;
        this.gridType = type;
        this.currentType = type;

        // Set backdrop intensity
        this.setBackdropIntensity(type);

        // Render grid content
        this.renderGridLightbox(items, type, title);

        // Show lightbox
        this.show();
    },

    /**
     * Render grid/list lightbox content
     * @param {Array} items - Items to display
     * @param {string} type - Content type
     * @param {string} title - Grid title
     */
    renderGridLightbox(items, type, title) {
        if (!this.elements.content) return;

        // Add grid class to lightbox
        this.elements.lightbox.className = `universal-lightbox lightbox-grid lightbox-grid-${type}`;

        let gridHTML = '';

        switch (type) {
            case 'photo':
                gridHTML = this.renderPhotoGrid(items);
                break;

            case 'music':
                gridHTML = this.renderMusicGrid(items);
                break;

            case 'writing':
                gridHTML = this.renderWritingGrid(items);
                break;

            case 'project':
                gridHTML = this.renderProjectGrid(items);
                break;

            default:
                gridHTML = '<p>Unsupported grid type</p>';
        }

        this.elements.content.innerHTML = `
            <div class="lightbox-grid-container">
                <h2 class="lightbox-grid-title">${title}</h2>
                <div class="lightbox-grid-items">
                    ${gridHTML}
                </div>
            </div>
        `;

        console.log('Lightbox: HTML inserted into DOM');
        console.log('Lightbox: Content element:', this.elements.content);
        console.log('Lightbox: innerHTML length:', this.elements.content.innerHTML.length);

        // Add click handlers to grid items
        const gridItems = this.elements.content.querySelectorAll('.grid-item, .photo-grid-card, .track-grid-card, .project-grid-card, .writing-grid-card');
        console.log('Lightbox: Found', gridItems.length, 'grid items in DOM');
        gridItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const selectedItem = items[index];

                // Close grid and open individual item
                this.isGridMode = false;
                this.open(selectedItem, type, items, index);
            });
        });
    },

    /**
     * Render photo grid
     * @param {Array} photos - Photos to display
     * @returns {string} HTML string
     */
    renderPhotoGrid(photos) {
        console.log('Lightbox: renderPhotoGrid called with', photos.length, 'photos');
        return photos.map((photo, index) => {
            // Build thumbnail URL
            const parts = photo.filename ? photo.filename.split('.') : [];
            const basename = parts.length >= 2 ? parts.slice(0, -1).join('.') : photo.filename || 'placeholder';
            const extension = parts.length >= 2 ? parts[parts.length - 1] : 'webp';
            const thumbnailUrl = `content/photography/${basename}_thumbnail.${extension}`;

            console.log(`Photo ${index}: ${photo.title} -> ${thumbnailUrl}`);

            return `
                <div class="photo-grid-card" data-index="${index}">
                    <img src="${thumbnailUrl}" alt="${photo.title || 'Photo'}" class="photo-grid-img">
                    <p class="photo-grid-title">${photo.title || 'Untitled'}</p>
                </div>
            `;
        }).join('');
    },

    /**
     * Render music grid
     * @param {Array} tracks - Tracks to display
     * @returns {string} HTML string
     */
    renderMusicGrid(tracks) {
        return tracks.map((track, index) => {
            const coverUrl = track.coverArt || 'content/music/default-cover.webp';

            return `
                <div class="grid-item grid-item-music" data-index="${index}">
                    <div class="grid-item-thumbnail" style="background-image: url('${coverUrl}')"></div>
                    <div class="grid-item-info">
                        <h3>${track.title || 'Untitled'}</h3>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render writing grid (list view)
     * @param {Array} writings - Writings to display
     * @returns {string} HTML string
     */
    renderWritingGrid(writings) {
        return writings.map((writing, index) => {
            return `
                <div class="grid-item grid-item-writing" data-index="${index}">
                    <div class="grid-item-info">
                        <h3>${writing.title || 'Untitled'}</h3>
                        <p class="grid-item-description">${writing.description || writing.excerpt || ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render project grid
     * @param {Array} projects - Projects to display
     * @returns {string} HTML string
     */
    renderProjectGrid(projects) {
        return projects.map((project, index) => {
            const thumbnailUrl = `content/projects/${project.id}_thumbnail.webp`;

            return `
                <div class="grid-item grid-item-project" data-index="${index}">
                    <div class="grid-item-thumbnail" style="background-image: url('${thumbnailUrl}')"></div>
                    <div class="grid-item-info">
                        <h3>${project.title || 'Untitled'}</h3>
                        <p class="grid-item-description">${project.description || ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// Export for use in other modules
window.UniversalContentLightbox = UniversalContentLightbox;
