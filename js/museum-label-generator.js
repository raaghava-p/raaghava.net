/**
 * Museum Label Generator
 * Generates standardized museum-style labels for artworks and content
 */

const MuseumLabelGenerator = {

    /**
     * Generate a museum label for photography/visual art
     * @param {Object} artwork - Artwork metadata object
     * @returns {string} HTML string for the museum label
     */
    generatePhotoLabel(artwork) {
        const {
            title,
            year,
            medium,
            dimensions,
            description,
            camera,
            lens,
            settings,
            location
        } = artwork;

        let label = `
            <div class="museum-label photo-label">
                <div class="label-title">${title}</div>
                ${year ? `<div class="label-year">${year}</div>` : ''}
                ${medium ? `<div class="label-medium">${medium}</div>` : ''}
                ${dimensions ? `<div class="label-dimensions">${dimensions}</div>` : ''}
                ${description ? `<div class="label-description">${description}</div>` : ''}
        `;

        // Technical details section for photography
        if (camera || lens || settings) {
            label += `<div class="label-technical">`;
            if (camera) label += `<div class="label-camera">${camera}</div>`;
            if (lens) label += `<div class="label-lens">${lens}</div>`;
            if (settings) label += `<div class="label-settings">${settings}</div>`;
            label += `</div>`;
        }

        if (location) {
            label += `<div class="label-location">${location}</div>`;
        }

        label += `</div>`;
        return label;
    },

    /**
     * Generate a museum label for written works
     * @param {Object} writing - Writing metadata object
     * @returns {string} HTML string for the museum label
     */
    generateWritingLabel(writing) {
        const {
            title,
            date,
            author,
            excerpt,
            readTime,
            tags
        } = writing;

        let label = `
            <div class="museum-label writing-label">
                <div class="label-title">${title}</div>
                ${author ? `<div class="label-author">by ${author}</div>` : ''}
                ${date ? `<div class="label-date">${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
                ${readTime ? `<div class="label-duration">${readTime}</div>` : ''}
                ${excerpt ? `<div class="label-description">${excerpt}</div>` : ''}
                ${tags && tags.length ? `<div class="label-tags">${tags.join(' • ')}</div>` : ''}
            </div>
        `;
        return label;
    },

    /**
     * Generate a museum label for music
     * @param {Object} music - Music metadata object
     * @returns {string} HTML string for the museum label
     */
    generateMusicLabel(music) {
        const {
            title,
            artist,
            album,
            year,
            genre,
            duration,
            description,
            license
        } = music;

        let label = `
            <div class="museum-label music-label">
                <div class="label-title">${title}</div>
                ${artist ? `<div class="label-artist">by ${artist}</div>` : ''}
                ${album ? `<div class="label-album">from "${album}"</div>` : ''}
                <div class="label-meta">
                    ${year ? `<span class="label-year">${year}</span>` : ''}
                    ${genre ? `<span class="label-genre">${genre}</span>` : ''}
                    ${duration ? `<span class="label-duration">${duration}</span>` : ''}
                </div>
                ${description ? `<div class="label-description">${description}</div>` : ''}
                ${license ? `<div class="label-license">${license}</div>` : ''}
            </div>
        `;
        return label;
    },

    /**
     * Generate a museum label for curated content
     * @param {Object} item - Curated item metadata object
     * @returns {string} HTML string for the museum label
     */
    generateCuratedLabel(item) {
        const {
            title,
            author,
            director,
            artist,
            year,
            genre,
            description,
            myRating,
            commentary,
            url
        } = item;

        let label = `
            <div class="museum-label curated-label">
                <div class="label-title">${title}</div>
        `;

        // Handle different types of creators
        if (author) label += `<div class="label-creator">by ${author}</div>`;
        if (director) label += `<div class="label-creator">directed by ${director}</div>`;
        if (artist) label += `<div class="label-creator">by ${artist}</div>`;

        label += `
                ${year ? `<div class="label-year">${year}</div>` : ''}
                ${genre ? `<div class="label-genre">${genre}</div>` : ''}
                ${description ? `<div class="label-description">${description}</div>` : ''}
                ${myRating ? `<div class="label-rating">Personal Rating: ${myRating}</div>` : ''}
                ${commentary ? `<div class="label-commentary">"${commentary}"</div>` : ''}
                ${url ? `<div class="label-link"><a href="${url}" target="_blank" rel="noopener">View External Link</a></div>` : ''}
            </div>
        `;
        return label;
    },

    /**
     * Generate a simple title label for section headers
     * @param {string} title - Section title
     * @param {string} subtitle - Optional subtitle
     * @returns {string} HTML string for the section label
     */
    generateSectionLabel(title, subtitle = '') {
        return `
            <div class="museum-label section-label">
                <div class="label-title">${title}</div>
                ${subtitle ? `<div class="label-subtitle">${subtitle}</div>` : ''}
            </div>
        `;
    },

    /**
     * Generate label based on content type
     * @param {Object} content - Content metadata object
     * @param {string} type - Content type ('photo', 'writing', 'music', 'curated')
     * @returns {string} HTML string for the museum label
     */
    generateLabel(content, type) {
        switch (type) {
            case 'photo':
            case 'photography':
                return this.generatePhotoLabel(content);
            case 'writing':
            case 'article':
                return this.generateWritingLabel(content);
            case 'music':
            case 'audio':
                return this.generateMusicLabel(content);
            case 'curated':
                return this.generateCuratedLabel(content);
            default:
                console.warn('MuseumLabelGenerator: Unknown content type:', type);
                return this.generateSectionLabel(content.title || 'Untitled');
        }
    }
};

// Export for use in other modules
window.MuseumLabelGenerator = MuseumLabelGenerator;