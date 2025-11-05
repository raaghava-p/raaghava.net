/**
 * Content Loading System - Handles dynamic content fetching and caching
 * Loads markdown files, JSON data, and manages content display
 */

const ContentLoader = {
    // Content cache for performance
    cache: new Map(),

    // Loading state management
    loadingStates: new Set(),

    /**
     * Generate picture element with WebP and fallback support
     * @param {string} filename - Base filename (without extension)
     * @param {string} alt - Alt text for accessibility
     * @param {string} cssClass - CSS class for styling
     * @param {boolean} lazy - Enable lazy loading
     */
    generatePictureElement(filename, alt, cssClass = '', lazy = true) {
        const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const lazyAttr = lazy ? 'loading="lazy"' : '';

        return `
            <picture class="${cssClass}">
                <source srcset="content/photos/web/${baseName}.webp" type="image/webp">
                <img src="content/photos/web/${baseName}.png"
                     alt="${alt}"
                     ${lazyAttr}
                     onerror="this.style.display='none'">
            </picture>
        `;
    },

    /**
     * Load and display markdown content
     * @param {string} path - Path to markdown file
     * @param {HTMLElement} element - Element to render content into
     */
    async loadContent(path, element) {
        const fullPath = `content/${path}`;

        try {
            this.showLoading(element);

            // Check cache first
            if (this.cache.has(fullPath)) {
                console.log(`ContentLoader: Loading from cache: ${fullPath}`);
                this.renderMarkdown(this.cache.get(fullPath), element);
                return;
            }

            console.log(`ContentLoader: Fetching content: ${fullPath}`);

            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status}`);
            }

            const markdown = await response.text();

            // Cache the content
            this.cache.set(fullPath, markdown);

            // Render the content
            this.renderMarkdown(markdown, element);

        } catch (error) {
            console.error('ContentLoader: Error loading content:', error);
            this.showError(element, `Failed to load content: ${path}`);
        }
    },

    /**
     * Load and display blog post list
     * @param {HTMLElement} element - Element to render list into
     */
    async loadBlogList(element) {
        try {
            this.showLoading(element);

            const response = await fetch('content/writings/writings.json', {
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`Failed to load blog index: ${response.status}`);
            }

            const data = await response.json();
            const posts = Array.isArray(data.articles) ? data.articles : [];

            this.renderBlogList(posts, element);

        } catch (error) {
            console.error('ContentLoader: Error loading blog list:', error);
            this.showError(element, 'Failed to load blog posts');
        }
    },

    /**
     * Load and display photo gallery
     * @param {string} jsonPath - Path to gallery JSON file
     * @param {HTMLElement} element - Element to render gallery into
     */
    async loadGallery(jsonPath, element) {
        try {
            this.showLoading(element);

            const fullPath = `content/${jsonPath}`;

            // Check cache first
            if (this.cache.has(fullPath)) {
                console.log(`ContentLoader: Loading gallery from cache: ${fullPath}`);
                this.renderGallery(this.cache.get(fullPath), element);
                return;
            }

            console.log(`ContentLoader: Fetching gallery: ${fullPath}`);

            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`Failed to load gallery: ${response.status}`);
            }

            const galleryData = await response.json();

            // Cache the data
            this.cache.set(fullPath, galleryData);

            // Render the gallery
            this.renderGallery(galleryData, element);

        } catch (error) {
            console.error('ContentLoader: Error loading gallery:', error);
            this.showError(element, 'Failed to load gallery');
        }
    },

    /**
     * Render markdown content with museum styling
     * @param {string} markdown - Markdown content to render
     * @param {HTMLElement} element - Element to render into
     */
    renderMarkdown(markdown, element) {
        // Parse frontmatter if present
        const { frontmatter, content } = this.parseFrontmatter(markdown);

        // Convert markdown to HTML using the shared markdown parser
        const htmlContent = (window.MarkdownParser && typeof window.MarkdownParser.parse === 'function')
            ? window.MarkdownParser.parse(content)
            : (window.marked && typeof window.marked.parse === 'function')
                ? window.marked.parse(content)
                : content;

        // Create museum-style content display
        let output = '';

        if (frontmatter.title) {
            output += `<h2>${frontmatter.title}</h2>`;
        }

        output += `<div class="content-body">${htmlContent}</div>`;

        if (frontmatter.date) {
            const date = new Date(frontmatter.date).toLocaleDateString();
            output += `<div class="museum-label">${date}</div>`;
        }

        element.innerHTML = output;

        // Add content animation
        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 400);

        // Setup lazy loading for images
        this.setupLazyLoading(element);
    },

    /**
     * Render blog post list with navigation
     * @param {Array} posts - Array of blog post objects
     * @param {HTMLElement} element - Element to render into
     */
    renderBlogList(posts, element) {
        element.innerHTML = '';

        const heading = document.createElement('h2');
        heading.textContent = 'Writings';
        element.appendChild(heading);

        const listWrapper = document.createElement('div');
        listWrapper.className = 'blog-list';

        const sortedPosts = [...posts].sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA;
        });

        if (sortedPosts.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'blog-empty';
            emptyState.textContent = 'No writings published yet.';
            listWrapper.appendChild(emptyState);
        } else {
            sortedPosts.forEach((post) => {
                if (!post || !post.filename) {
                    return;
                }

                const article = document.createElement('article');
                article.className = 'blog-post-preview';
                article.setAttribute('role', 'button');
                article.tabIndex = 0;
                article.dataset.filename = post.filename;

                const title = document.createElement('h3');
                title.textContent = post.title || post.filename;
                article.appendChild(title);

                if (post.excerpt) {
                    const excerpt = document.createElement('p');
                    excerpt.className = 'blog-excerpt';
                    excerpt.textContent = post.excerpt;
                    article.appendChild(excerpt);
                }

                if (post.date) {
                    const time = document.createElement('time');
                    const parsed = new Date(post.date);
                    time.className = 'blog-date';

                    if (!Number.isNaN(parsed.valueOf())) {
                        time.dateTime = parsed.toISOString();
                        time.textContent = parsed.toLocaleDateString();
                    } else {
                        time.textContent = post.date;
                    }

                    article.appendChild(time);
                }

                const activate = (event) => {
                    event.preventDefault();
                    this.loadBlogPost(post.filename);
                };

                article.addEventListener('click', activate);
                article.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        activate(event);
                    }
                });

                listWrapper.appendChild(article);
            });
        }

        element.appendChild(listWrapper);

        const label = document.createElement('div');
        label.className = 'museum-label';
        label.textContent = 'personal writings';
        element.appendChild(label);

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 400);
    },

    /**
     * Load and display individual blog post
     * @param {string} filename - Blog post filename
     */
    async loadBlogPost(filename) {
        // Navigate to individual blog post route
        // This would be implemented as a sub-route system
        console.log(`Loading blog post: ${filename}`);

        // For now, load directly into back wall
        const backWall = document.querySelector('.back-wall .content-frame');
        await this.loadContent(`blog/${filename}`, backWall);
    },

    /**
     * Render photo gallery with navigation
     * @param {Object} galleryData - Gallery JSON data
     * @param {HTMLElement} element - Element to render into
     */
    renderGallery(galleryData, element) {
        if (!galleryData.photos || galleryData.photos.length === 0) {
            element.innerHTML = '<h3>No photos found</h3>';
            return;
        }

        // Start with first photo
        this.currentPhotoIndex = 0;
        this.galleryPhotos = galleryData.photos;

        this.renderPhoto(this.galleryPhotos[0], element);
    },

    /**
     * Render individual photo with museum presentation
     * @param {Object} photo - Photo object from JSON
     * @param {HTMLElement} element - Element to render into
     */
    renderPhoto(photo, element) {
        const output = `
            <div class="photo-display">
                ${this.generatePictureElement(photo.filename, photo.title, 'gallery-image')}

                <div class="photo-info">
                    <h3>${photo.title}</h3>
                    ${photo.caption ? `<p>${photo.caption}</p>` : ''}
                </div>

                <div class="gallery-controls">
                    <button onclick="ContentLoader.previousPhoto()" class="control-btn">← Previous</button>
                    <span class="photo-counter">
                        ${this.currentPhotoIndex + 1} of ${this.galleryPhotos.length}
                    </span>
                    <button onclick="ContentLoader.nextPhoto()" class="control-btn">Next →</button>
                </div>

                <div class="museum-label">
                    ${photo.camera ? photo.camera : ''} • ${photo.date}
                </div>
            </div>
        `;

        element.innerHTML = output;

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 400);
    },

    /**
     * Navigate to next photo in gallery
     */
    nextPhoto() {
        if (this.currentPhotoIndex < this.galleryPhotos.length - 1) {
            this.currentPhotoIndex++;
            const element = document.querySelector('.back-wall .content-frame');
            this.renderPhoto(this.galleryPhotos[this.currentPhotoIndex], element);
        }
    },

    /**
     * Navigate to previous photo in gallery
     */
    previousPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            const element = document.querySelector('.back-wall .content-frame');
            this.renderPhoto(this.galleryPhotos[this.currentPhotoIndex], element);
        }
    },

    /**
     * Parse YAML frontmatter from markdown
     * @param {string} markdown - Markdown content with potential frontmatter
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
        let currentKey = null;

        lines.forEach((rawLine) => {
            const line = rawLine.trim();
            if (!line) {
                return;
            }

            if (line.startsWith('-') && currentKey && Array.isArray(frontmatter[currentKey])) {
                frontmatter[currentKey].push(line.substring(1).trim());
                return;
            }

            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                return;
            }

            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            if (!key) {
                return;
            }

            if (!value) {
                frontmatter[key] = [];
                currentKey = key;
                return;
            }

            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }

            if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    frontmatter[key] = JSON.parse(value.replace(/'/g, '"'));
                } catch (error) {
                    frontmatter[key] = value;
                }
                currentKey = key;
                return;
            }

            frontmatter[key] = value;
            currentKey = key;
        });

        return { frontmatter, content };
    },

    /**
     * Setup lazy loading for images in content
     * @param {HTMLElement} element - Container element
     */
    setupLazyLoading(element) {
        const images = element.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    },

    /**
     * Show loading state in element
     * @param {HTMLElement} element - Element to show loading in
     */
    showLoading(element) {
        element.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    },

    /**
     * Show error state in element
     * @param {HTMLElement} element - Element to show error in
     * @param {string} message - Error message
     */
    showError(element, message) {
        element.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="control-btn">
                    Reload Page
                </button>
            </div>
        `;
    },

    /**
     * Prefetch content for better performance
     * @param {string} path - Content path to prefetch
     */
    async prefetchContent(path) {
        if (this.cache.has(path) || this.loadingStates.has(path)) {
            return; // Already cached or loading
        }

        this.loadingStates.add(path);

        try {
            const response = await fetch(`content/${path}`);
            if (response.ok) {
                const content = await response.text();
                this.cache.set(`content/${path}`, content);
                console.log(`ContentLoader: Prefetched ${path}`);
            }
        } catch (error) {
            console.warn(`ContentLoader: Failed to prefetch ${path}:`, error);
        } finally {
            this.loadingStates.delete(path);
        }
    },

    /**
     * Clear content cache
     */
    clearCache() {
        this.cache.clear();
        console.log('ContentLoader: Cache cleared');
    }
};

// Export for use in other modules
window.ContentLoader = ContentLoader;
