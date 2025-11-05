/**
 * About Controller
 * Loads and renders markdown-based about page content
 */

const AboutController = {
    bioContent: null,
    data: null,

    /**
     * Initialize about page
     */
    async init() {
        console.log('AboutController: Initializing');
        await this.loadAboutData();
        await this.loadBioMarkdown();
        this.render();
    },

    /**
     * Load about metadata from JSON
     */
    async loadAboutData() {
        try {
            const response = await fetch('content/about/about.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            console.log('AboutController: Loaded metadata');
        } catch (error) {
            console.error('AboutController: Failed to load about.json:', error);
            // Set minimal defaults
            this.data = {
                name: '',
                contact: {},
                links: []
            };
        }
    },

    /**
     * Load and parse markdown bio
     */
    async loadBioMarkdown() {
        try {
            const response = await fetch('content/about/bio.md');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();

            // Parse markdown using marked.js
            if (typeof marked !== 'undefined') {
                this.bioContent = marked.parse(markdown);
            } else {
                console.warn('AboutController: marked.js not loaded, using plain text');
                this.bioContent = `<pre>${markdown}</pre>`;
            }

            console.log('AboutController: Loaded bio markdown');
        } catch (error) {
            console.error('AboutController: Failed to load bio.md:', error);
            this.bioContent = '<p>Bio content coming soon.</p>';
        }
    },

    /**
     * Render about page
     */
    render() {
        console.log('AboutController: Rendering');

        const room = document.getElementById('room');
        if (!room) return;

        // Use 3-wall layout
        room.className = 'room three-wall-layout';

        // Clear all walls
        this.clearAllWalls();

        // Render content on back wall
        this.renderBackWall();

        // Optional: Add contact/links to side walls
        this.renderLeftWall();
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
     * Render BACK WALL - Main bio content
     */
    renderBackWall() {
        const backContent = document.getElementById('back-content');
        if (!backContent) return;

        backContent.innerHTML = `
            <div class="content-frame about-content">
                <div class="about-bio markdown-content">
                    ${this.bioContent}
                </div>
            </div>
        `;
    },

    /**
     * Render LEFT WALL - Contact info and links
     */
    renderLeftWall() {
        const leftContent = document.getElementById('left-content');
        if (!leftContent) return;

        const hasContact = this.data.contact && (this.data.contact.email || this.data.contact.location);
        const hasLinks = this.data.links && this.data.links.length > 0;

        if (!hasContact && !hasLinks) return;

        let linksHtml = '';
        if (hasLinks) {
            linksHtml = this.data.links.map(link => `
                <a href="${link.url}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="social-link">
                    ${link.label}
                </a>
            `).join('');
        }

        leftContent.innerHTML = `
            <div class="content-frame">
                <div class="left-wall-content">
                    ${hasContact ? `
                        <div class="contact-section">
                            <h3>Reach Out</h3>
                            ${this.data.contact.email ? `
                                <p><a href="mailto:${this.data.contact.email}">${this.data.contact.email}</a></p>
                            ` : ''}
                            ${this.data.contact.location ? `
                                <p class="location">${this.data.contact.location}</p>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${hasLinks ? `
                        <div class="links-section">
                            <div class="social-links">
                                ${linksHtml}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render RIGHT WALL - Testimonial only
     */
    renderRightWall() {
        const rightContent = document.getElementById('right-content');
        if (!rightContent) return;

        rightContent.innerHTML = `
            <div class="content-frame">
                <div class="testimonial-section">
                    <h3>Testimonial</h3>
                    <blockquote class="testimonial">
                        thumba jaana, swalpa kona
                    </blockquote>
                    <p class="testimonial-attribution">— my mother</p>
                </div>
            </div>
        `;
    }
};

// Make globally accessible
window.AboutController = AboutController;
