/**
 * Writings Controller - REDESIGNED
 * 3-wall layout: Years list | Articles display | Featured + Random
 */

const WritingsController = {
    writings: null,
    collections: null,
    selectedYear: null,
    availableYears: [],
    featuredArticle: null,

    /**
     * Initialize writings system
     */
    async init() {
        console.log('WritingsController: Initializing');
        await this.loadWritingsData();
        this.extractYears();
        this.identifyFeaturedArticle();
    },

    /**
     * Load writings data from JSON
     */
    async loadWritingsData() {
        try {
            const response = await fetch('content/writings/writings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Convert articles array to object keyed by ID/filename
            this.writings = {};
            if (data.articles && Array.isArray(data.articles)) {
                data.articles.forEach(article => {
                    const id = article.filename || article.title;
                    this.writings[id] = article;
                });
            }

            this.collections = data.collections || {};

            console.log('WritingsController: Loaded', Object.keys(this.writings).length, 'articles');
        } catch (error) {
            console.error('WritingsController: Failed to load data:', error);
            this.writings = {};
            this.collections = {};
        }
    },

    /**
     * Extract unique years from articles
     */
    extractYears() {
        const years = new Set();
        Object.values(this.writings).forEach(article => {
            if (article.datePublished) {
                const year = new Date(article.datePublished).getFullYear();
                years.add(year);
            }
        });
        this.availableYears = Array.from(years).sort((a, b) => b - a); // Newest first
    },

    /**
     * Identify featured article
     */
    identifyFeaturedArticle() {
        for (const article of Object.values(this.writings)) {
            if (article.featured) {
                this.featuredArticle = article;
                break;
            }
        }
    },

    /**
     * Render writings page with 3-wall layout
     */
    render() {
        console.log('WritingsController: Rendering');

        if (!this.writings || Object.keys(this.writings).length === 0) {
            this.renderEmptyState();
            return;
        }

        const room = document.getElementById('room');
        if (!room) return;

        // Use 3-wall layout
        room.className = 'room three-wall-layout';

        // Clear all walls
        this.clearAllWalls();

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
     * Render LEFT WALL - Years list
     */
    renderLeftWall() {
        const leftContent = document.getElementById('left-content');
        if (!leftContent) return;

        const yearButtons = this.availableYears.map(year => {
            const isActive = year === this.selectedYear ? 'active' : '';
            return `
                <button class="collection-text-button ${isActive}" onclick="WritingsController.selectYear(${year})">
                    ${year}
                </button>
            `;
        }).join('');

        leftContent.innerHTML = `
            <div class="wall-content">
                <h3 class="wall-section-title">By Year</h3>
                <div class="collection-list">
                    ${yearButtons}
                </div>
            </div>
        `;
    },

    /**
     * Render CENTER WALL - Articles display
     */
    renderCenterWall() {
        const backContent = document.getElementById('back-content');
        if (!backContent) return;

        // Get articles sorted by date (newest first)
        const sortedArticles = Object.values(this.writings).sort((a, b) => {
            return new Date(b.datePublished) - new Date(a.datePublished);
        });

        if (this.selectedYear) {
            // Show articles from selected year
            this.renderYearArticles(backContent, sortedArticles);
        } else {
            // Show default view: Latest + Previous
            this.renderDefaultArticles(backContent, sortedArticles);
        }
    },

    /**
     * Render default articles view (Latest + Previous)
     */
    renderDefaultArticles(container, sortedArticles) {
        const latestArticle = sortedArticles[0];
        const previousArticles = sortedArticles.slice(1, 3);

        const latestHTML = latestArticle ? `
            <div class="article-section">
                <h4 class="article-section-heading">Latest:</h4>
                <div class="article-item" onclick='WritingsController.openArticleInLightbox("${latestArticle.filename || latestArticle.title}")'>
                    <h3 class="article-title">${latestArticle.title}</h3>
                    <p class="article-description">${latestArticle.description || latestArticle.excerpt || ''}</p>
                </div>
            </div>
        ` : '';

        const previousHTML = previousArticles.length > 0 ? `
            <div class="article-section">
                <h4 class="article-section-heading">Previous:</h4>
                ${previousArticles.map(article => `
                    <div class="article-item" onclick='WritingsController.openArticleInLightbox("${article.filename || article.title}")'>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-description">${article.description || article.excerpt || ''}</p>
                    </div>
                `).join('')}
            </div>
        ` : '';

        container.innerHTML = `
            <div class="wall-content">
                ${latestHTML}
                ${previousHTML}
                <button class="more-label bottom-right" onclick="WritingsController.openArticlesGrid()">
                    more
                </button>
            </div>
        `;
    },

    /**
     * Render articles from selected year
     */
    renderYearArticles(container, sortedArticles) {
        const yearArticles = sortedArticles.filter(article => {
            const year = new Date(article.datePublished).getFullYear();
            return year === this.selectedYear;
        }).slice(0, 3);

        const articlesHTML = yearArticles.map(article => `
            <div class="article-item" onclick='WritingsController.openArticleInLightbox("${article.filename || article.title}")'>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-description">${article.description || article.excerpt || ''}</p>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="wall-content">
                <h2 class="collection-title">${this.selectedYear}</h2>
                <div class="article-section">
                    ${articlesHTML}
                </div>
                <button class="more-label bottom-right" onclick="WritingsController.openArticlesGrid()">
                    more
                </button>
            </div>
        `;
    },

    /**
     * Render RIGHT WALL - Featured + Random
     */
    renderRightWall() {
        const rightContent = document.getElementById('right-content');
        if (!rightContent) return;

        const featuredHTML = this.featuredArticle ? `
            <div class="featured-section">
                <h4 class="wall-section-title">Featured</h4>
                <div class="article-item" onclick='WritingsController.openArticleInLightbox("${this.featuredArticle.filename || this.featuredArticle.title}")'>
                    <h3 class="article-title">${this.featuredArticle.title}</h3>
                    <p class="article-description">${this.featuredArticle.description || this.featuredArticle.excerpt || ''}</p>
                </div>
            </div>
        ` : '';

        rightContent.innerHTML = `
            <div class="wall-content">
                ${featuredHTML}
                <button class="wall-button random-button" onclick="WritingsController.openRandomArticle()">
                    <h3>Random</h3>
                </button>
            </div>
        `;
    },

    /**
     * Select a year
     * @param {number} year - Year to select
     */
    selectYear(year) {
        console.log('WritingsController: Selecting year:', year);
        this.selectedYear = year;
        this.renderCenterWall();
        this.renderLeftWall(); // Re-render to update active state
    },

    /**
     * Open articles grid lightbox
     */
    openArticlesGrid() {
        let articles;
        let title;

        if (this.selectedYear) {
            // Show articles from selected year
            articles = Object.values(this.writings)
                .filter(article => {
                    const year = new Date(article.datePublished).getFullYear();
                    return year === this.selectedYear;
                })
                .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
            title = `${this.selectedYear}`;
        } else {
            // Show all articles
            articles = Object.values(this.writings)
                .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
            title = 'All Articles';
        }

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.openGrid(
                articles,
                'writing',
                title
            );
        }
    },

    /**
     * Open article in lightbox
     * @param {string} articleId - Article ID (filename or title)
     */
    async openArticleInLightbox(articleId) {
        const article = this.writings[articleId];
        if (!article) {
            console.error('WritingsController: Article not found:', articleId);
            return;
        }

        // Load full content if filename provided
        let fullContent = article;
        if (article.filename) {
            fullContent = await this.loadWritingContent(article);
        }

        // Get all articles for navigation
        const allArticles = Object.values(this.writings)
            .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

        const index = allArticles.findIndex(a =>
            (a.filename || a.title) === (article.filename || article.title)
        );

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                fullContent,
                window.UniversalContentLightbox.ContentTypes.WRITING,
                allArticles,
                index
            );
        }
    },

    /**
     * Open random article
     */
    openRandomArticle() {
        const allArticles = Object.values(this.writings);
        if (allArticles.length === 0) return;

        const randomIndex = Math.floor(Math.random() * allArticles.length);
        const randomArticle = allArticles[randomIndex];

        this.openArticleInLightbox(randomArticle.filename || randomArticle.title);
    },

    /**
     * Load full writing content from markdown file
     * @param {Object} writing - Writing metadata
     * @returns {Object} Writing with full content
     */
    async loadWritingContent(writing) {
        try {
            const response = await fetch(`content/writings/${writing.filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load writing: ${response.status}`);
            }

            const markdown = await response.text();

            // Parse frontmatter and content
            const { frontmatter, content } = this.parseFrontmatter(markdown);

            // Convert markdown to HTML
            const htmlContent = this.markdownToHTML(content);

            // Merge metadata
            return {
                ...writing,
                ...frontmatter,
                content: htmlContent
            };

        } catch (error) {
            console.error('WritingsController: Error loading content:', error);
            return writing;
        }
    },

    /**
     * Parse YAML frontmatter from markdown
     * @param {string} markdown - Markdown content
     * @returns {Object} { frontmatter, content }
     */
    parseFrontmatter(markdown) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
        const match = markdown.match(frontmatterRegex);

        if (!match) {
            return { frontmatter: {}, content: markdown };
        }

        const frontmatterText = match[1];
        const content = markdown.slice(match[0].length);

        const frontmatter = {};
        const lines = frontmatterText.split(/\r?\n/);

        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) return;

            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            if (!key) return;

            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }

            frontmatter[key] = value;
        });

        return { frontmatter, content };
    },

    /**
     * Convert markdown to HTML
     * @param {string} markdown - Markdown content
     * @returns {string} HTML content
     */
    markdownToHTML(markdown) {
        // Use marked.js if available
        if (window.marked && typeof window.marked.parse === 'function') {
            return window.marked.parse(markdown);
        }

        // Simple fallback
        return markdown
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
    },

    /**
     * Render empty state when no articles available
     */
    renderEmptyState() {
        const room = document.getElementById('room');
        if (!room) return;

        room.className = 'room single-wall-layout';

        const backContent = document.getElementById('back-content');
        if (backContent) {
            backContent.innerHTML = `
                <div class="empty-state">
                    <h2>No Writings Available</h2>
                    <p>Check back later for articles.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.WritingsController = WritingsController;
