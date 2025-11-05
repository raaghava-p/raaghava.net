/**
 * Main Application Controller - Coordinates all systems
 * Entry point that initializes and connects all components
 */

const App = {
    // Application state
    isInitialized: false,
    isLoading: false,

    // Cached DOM elements for performance
    elements: {
        room: null,
        sitemap: null,
        sitemapNav: null,
        loading: null,
        error: null,
        backBtn: null,
        sitemapToggle: null
    },

    /**
     * Initialize the entire application
     */
    async init() {
        console.log('App: Starting initialization');

        try {
            // Show loading state
            this.showGlobalLoading();

            // Initialize core systems in order
            await this.initializeSystems();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Setup mobile orientation detection
            this.setupOrientationDetection();

            // Mark as initialized
            this.isInitialized = true;

            // Hide loading state
            this.hideGlobalLoading();

            console.log('App: Initialization complete');

        } catch (error) {
            console.error('App: Initialization failed:', error);
            this.showGlobalError('Failed to initialize application');
        }
    },

    /**
     * Cache frequently accessed DOM elements for performance
     */
    cacheElements() {
        this.elements.room = document.getElementById('room');
        this.elements.sitemap = document.getElementById('sitemap');
        this.elements.sitemapNav = document.getElementById('sitemap-nav');
        this.elements.loading = document.getElementById('loading');
        this.elements.error = document.getElementById('error');
        this.elements.backBtn = document.getElementById('back-btn');
        this.elements.sitemapToggle = document.getElementById('sitemap-toggle');

        console.log('App: DOM elements cached');
    },

    /**
     * Initialize all core systems
     */
    async initializeSystems() {
        // Cache DOM elements first
        this.cacheElements();
        // Theme system (needs to be first for visual consistency)
        if (window.ThemeManager) {
            ThemeManager.init();
            ThemeManager.watchSystemTheme();
            ThemeManager.handleContrastPreference();
        }

        // Router system (handles navigation) - Initialize after theme system
        if (window.Router) {
            Router.init();
            console.log('App: Router initialized');
        }

        // Universal lightbox system (handles all content viewing)
        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.init();
            console.log('App: Lightbox system initialized');
        }

        // Initialize content controllers
        await this.initializeControllers();

        // Setup UI controls
        this.setupControls();

        // Setup sitemap system
        this.setupSitemap();

        // Initialize search system (after controllers are loaded)
        if (window.SearchSystem) {
            await window.SearchSystem.init();
            console.log('App: Search system initialized');
        }

        console.log('App: Core systems initialized');
    },

    /**
     * Initialize content controllers
     */
    async initializeControllers() {
        console.log('App: Initializing content controllers');

        // Initialize Photography Controller
        if (window.PhotographyController) {
            await window.PhotographyController.init();
            console.log('App: Photography Controller initialized');
        }

        // Initialize Writings Controller
        if (window.WritingsController) {
            await window.WritingsController.init();
            console.log('App: Writings Controller initialized');
        }

        // Initialize Music Controller
        if (window.MusicController) {
            await window.MusicController.init();
            console.log('App: Music Controller initialized');
        }

        // Initialize Projects Controller
        if (window.ProjectsController) {
            await window.ProjectsController.init();
            console.log('App: Projects Controller initialized');
        }

        // Initialize Curated Writings Controller
        if (window.CuratedWritingsController) {
            await window.CuratedWritingsController.init();
            console.log('App: Curated Writings Controller initialized');
        }

        // Initialize Curated Cinema Controller
        if (window.CuratedCinemaController) {
            await window.CuratedCinemaController.init();
            console.log('App: Curated Cinema Controller initialized');
        }

        // Initialize Curated Music Controller
        if (window.CuratedMusicController) {
            await window.CuratedMusicController.init();
            console.log('App: Curated Music Controller initialized');
        }

        // Initialize Curated Misc Controller
        if (window.CuratedMiscController) {
            await window.CuratedMiscController.init();
            console.log('App: Curated Misc Controller initialized');
        }

        console.log('App: All controllers initialized');
    },

    /**
     * Setup UI control handlers
     */
    setupControls() {
        try {
            // Back button
            if (this.elements.backBtn) {
                this.elements.backBtn.addEventListener('click', () => {
                    if (Router && typeof Router.goBack === 'function') {
                        Router.goBack();
                    }
                });
            } else {
                console.warn('App: Back button element not found');
            }

            // Sitemap toggle
            if (this.elements.sitemapToggle) {
                this.elements.sitemapToggle.addEventListener('click', () => {
                    this.toggleSitemap();
                });
            } else {
                console.warn('App: Sitemap toggle element not found');
            }

            // Search toggle
            const searchToggle = document.getElementById('search-toggle');
            if (searchToggle) {
                searchToggle.addEventListener('click', () => {
                    if (window.SearchSystem) {
                        window.SearchSystem.toggleSearch();
                    }
                });
            } else {
                console.warn('App: Search toggle element not found');
            }

            // Plaintext from overlay button
            const plaintextFromOverlay = document.getElementById('plaintext-from-overlay');
            if (plaintextFromOverlay) {
                plaintextFromOverlay.addEventListener('click', () => {
                    // Hide the rotate overlay first
                    const rotateOverlay = document.getElementById('rotate-overlay');
                    if (rotateOverlay) {
                        rotateOverlay.classList.add('hidden');
                    }
                    // Then show the sitemap
                    this.toggleSitemap();
                });
            }

            console.log('App: UI controls setup complete');
        } catch (error) {
            console.error('App: Error setting up controls:', error);
        }
    },

    /**
     * Setup sitemap overlay system
     */
    setupSitemap() {
        if (this.elements.sitemap && this.elements.sitemapNav) {
            // Generate sitemap content
            this.generateSitemap();

            // Close button
            const closeBtn = this.elements.sitemap.querySelector('.close-sitemap');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideSitemap();
                });
            }

            // Click outside to close
            this.elements.sitemap.addEventListener('click', (event) => {
                if (event.target === this.elements.sitemap) {
                    this.hideSitemap();
                }
            });
        }
    },

    /**
     * Generate complete content navigation - All site content accessible
     */
    generateSitemap() {
        if (!this.elements.sitemapNav || !Router || typeof Router.getNavigationTree !== 'function') {
            return;
        }

        const navigationRoot = this.elements.sitemapNav;
        navigationRoot.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'plain-header';
        header.innerHTML = '<h2>Now Also In Plaintext.</h2>';
        navigationRoot.appendChild(header);

        const list = document.createElement('ul');
        list.className = 'sitemap-list';

        Router.getNavigationTree().forEach((node) => {
            const listItem = this.createSitemapItem(node);
            if (listItem) {
                list.appendChild(listItem);
            }
        });

        navigationRoot.appendChild(list);
    },

    /**
     * Create a sitemap list item node recursively
     * @param {Object} node - Navigation node
     * @returns {HTMLLIElement|null}
     */
    createSitemapItem(node) {
        if (!node || !node.label) {
            return null;
        }

        const item = document.createElement('li');
        item.className = 'sitemap-item';

        if (typeof node.route === 'string') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sitemap-link';
            button.textContent = node.label;
            button.dataset.route = node.route;
            button.addEventListener('click', () => {
                this.navigateFromSitemap(node.route);
            });

            item.appendChild(button);
        } else {
            const label = document.createElement('span');
            label.className = 'sitemap-label';
            label.textContent = node.label;
            item.appendChild(label);
        }

        if (node.description) {
            const description = document.createElement('span');
            description.className = 'sitemap-description';
            description.textContent = node.description;
            item.appendChild(description);
        }

        if (Array.isArray(node.children) && node.children.length > 0) {
            const childList = document.createElement('ul');
            childList.className = 'sitemap-sublist';

            node.children.forEach((childNode) => {
                const childItem = this.createSitemapItem(childNode);
                if (childItem) {
                    childList.appendChild(childItem);
                }
            });

            item.appendChild(childList);
        }

        return item;
    },

    /**
     * Navigate from sitemap and close overlay
     * @param {string} route - Route to navigate to
     */
    navigateFromSitemap(route) {
        if (Router) {
            Router.navigateTo(route);
        }
        this.hideSitemap();
    },

    /**
     * Toggle sitemap visibility
     */
    toggleSitemap() {
        if (!this.elements.sitemap) return;

        if (this.elements.sitemap.classList.contains('hidden')) {
            this.showSitemap();
        } else {
            this.hideSitemap();
        }
    },

    /**
     * Show sitemap overlay
     */
    showSitemap() {
        if (!this.elements.sitemap) return;

        this.elements.sitemap.classList.remove('hidden');
        this.elements.sitemap.classList.add('entering');

        // Focus management for accessibility
        const firstLink = this.elements.sitemap.querySelector('a');
        if (firstLink) {
            firstLink.focus();
        }

        setTimeout(() => {
            this.elements.sitemap.classList.remove('entering');
        }, 300);
    },

    /**
     * Hide sitemap overlay
     */
    hideSitemap() {
        if (!this.elements.sitemap) return;

        this.elements.sitemap.classList.add('exiting');

        // Match the CSS animation duration exactly
        setTimeout(() => {
            this.elements.sitemap.classList.remove('exiting');
            this.elements.sitemap.classList.add('hidden');
        }, 200);
    },

    /**
     * Setup global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Don't trigger shortcuts when typing in inputs
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // If search is open, only allow Escape key
            if (window.SearchSystem && window.SearchSystem.isSearchOpen) {
                if (event.key.toLowerCase() === 'escape') {
                    event.preventDefault();
                    window.SearchSystem.closeSearch();
                }
                return; // Block all other shortcuts when search is open
            }

            switch (event.key.toLowerCase()) {
                case 'escape':
                    event.preventDefault();
                    // Close sitemap
                    this.hideSitemap();
                    break;

                case 'p':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        this.toggleSitemap();
                    }
                    break;

                case 'b':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        if (Router && typeof Router.goBack === 'function') {
                            Router.goBack();
                        }
                    }
                    break;

                case 'h':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        if (Router) {
                            Router.navigateTo('');
                        }
                    }
                    break;

                case 't':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        if (window.ThemeManager && typeof window.ThemeManager.toggle === 'function') {
                            window.ThemeManager.toggle();
                        }
                    }
                    break;

                case '/':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        if (window.SearchSystem) {
                            window.SearchSystem.openSearch();
                        }
                    }
                    break;

                // Arrow keys for navigation (if in gallery)
                case 'arrowleft':
                    if (ContentLoader && typeof ContentLoader.previousPhoto === 'function') {
                        event.preventDefault();
                        ContentLoader.previousPhoto();
                    }
                    break;

                case 'arrowright':
                    if (ContentLoader && typeof ContentLoader.nextPhoto === 'function') {
                        event.preventDefault();
                        ContentLoader.nextPhoto();
                    }
                    break;
            }
        });

        console.log('App: Keyboard shortcuts setup complete');
    },

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Handle errors globally
        window.addEventListener('error', (event) => {
            console.error('App: Global error:', event.error);
            this.showGlobalError('An unexpected error occurred');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('App: Unhandled promise rejection:', event.reason);
            event.preventDefault(); // Prevent default browser error handling
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('App: Connection restored');
            this.hideGlobalError();
        });

        window.addEventListener('offline', () => {
            console.log('App: Connection lost');
            this.showGlobalError('No internet connection - some content may not load');
        });

        // Handle window resize for responsive adjustments
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Setup cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        console.log('App: Global event listeners setup complete');
    },

    /**
     * Cleanup method to prevent memory leaks
     */
    cleanup() {
        console.log('App: Performing cleanup');

        // Remove event listeners that might cause memory leaks
        // Note: Most listeners are on window/document and will be cleaned up automatically
        // but we should clean up any custom event listeners on DOM elements

        // Clear cached DOM references
        Object.keys(this.elements).forEach(key => {
            this.elements[key] = null;
        });
    },

    /**
     * Debounce utility function for performance optimization
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Handle window resize events
     */
    handleResize() {
        // Recalculate any dynamic positioning or sizes
        console.log('App: Handling window resize');

        // Update CSS custom properties based on viewport
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    /**
     * Show global loading indicator
     */
    showGlobalLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
        }
        this.isLoading = true;
    },

    /**
     * Hide global loading indicator
     */
    hideGlobalLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
        }
        this.isLoading = false;
    },

    /**
     * Show global error message
     * @param {string} message - Error message to display
     */
    showGlobalError(message) {
        if (this.elements.error) {
            const messageElement = this.elements.error.querySelector('.error-message');
            if (messageElement) {
                messageElement.textContent = message;
            }

            this.elements.error.classList.remove('hidden');
            this.elements.error.classList.add('showing');

            // Setup close button
            const closeBtn = this.elements.error.querySelector('.error-close');
            if (closeBtn) {
                closeBtn.onclick = () => this.hideGlobalError();
            }

            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideGlobalError();
            }, 5000);
        }
    },

    /**
     * Hide global error message
     */
    hideGlobalError() {
        if (this.elements.error) {
            this.elements.error.classList.remove('showing');
            this.elements.error.classList.add('hidden');
        }
    },

    /**
     * Setup mobile/tablet detection and desktop viewing recommendation
     */
    setupOrientationDetection() {
        const rotateOverlay = document.getElementById('rotate-overlay');

        if (!rotateOverlay) {
            console.warn('App: Desktop recommendation overlay element not found');
            return;
        }

        // Function to check if we should show the overlay
        const shouldShowOverlay = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const aspectRatio = width / height;

            // Show on mobile devices in portrait orientation (aspect ratio less than 1.0)
            return width <= 768 && aspectRatio < 1.0;
        };

        // Function to update overlay visibility
        const updateOverlay = () => {
            if (shouldShowOverlay()) {
                rotateOverlay.classList.remove('hidden');
            } else {
                rotateOverlay.classList.add('hidden');
            }
        };

        // Initial check
        updateOverlay();

        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure dimensions are updated after rotation
            setTimeout(updateOverlay, 100);
        });

        // Also listen for resize events (covers other cases)
        window.addEventListener('resize', this.debounce(updateOverlay, 250));

        console.log('App: Desktop viewing detection setup complete');
    },

    /**
     * Get application state
     * @returns {Object} Current application state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isLoading: this.isLoading,
            currentRoute: Router ? Router.getCurrentRoute() : '',
            currentTheme: ThemeManager ? ThemeManager.getCurrentTheme() : 'light'
        };
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}

// Export for debugging and extensions
window.App = App;
