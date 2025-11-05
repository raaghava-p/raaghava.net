/**
 * Theme Management System - Handles light/dark mode toggle
 * Preserves image colors while inverting interface
 */

const ThemeManager = {
    // Current theme state
    currentTheme: 'light',

    // Storage key for persistence
    storageKey: 'museum-theme',

    /**
     * Initialize theme system
     */
    init() {
        console.log('ThemeManager: Initializing');

        // Load saved theme preference
        this.loadTheme();

        // Setup theme toggle button
        this.setupToggleButton();

        // Apply initial theme
        this.applyTheme(this.currentTheme);
    },

    /**
     * Load theme preference from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);

        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
            console.log(`ThemeManager: Loaded theme from storage: ${savedTheme}`);
        } else {
            // Check user's system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
            console.log(`ThemeManager: Using system preference: ${this.currentTheme}`);
        }
    },

    /**
     * Save theme preference to localStorage
     */
    saveTheme() {
        localStorage.setItem(this.storageKey, this.currentTheme);
        console.log(`ThemeManager: Saved theme: ${this.currentTheme}`);
    },

    /**
     * Setup theme toggle button event listener
     */
    setupToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');

        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });

            // Add keyboard shortcut (T key)
            document.addEventListener('keydown', (event) => {
                // Don't trigger when typing in inputs or when search is open
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                    return;
                }
                if (window.SearchSystem && window.SearchSystem.isSearchOpen) {
                    return;
                }

                if (event.key === 't' || event.key === 'T') {
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        this.toggleTheme();
                    }
                }
            });
        }
    },

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        console.log('ThemeManager: Toggling theme');

        // Add button animation
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.classList.add('changing');

            // Add pressed animation
            toggleButton.classList.add('pressed');
            setTimeout(() => {
                toggleButton.classList.remove('pressed');
            }, 100);
        }

        // Store previous theme before switching
        const previousTheme = this.currentTheme;

        // Switch theme
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';

        // Apply new theme
        this.applyTheme(this.currentTheme, previousTheme);

        // Save preference
        this.saveTheme();

        // Remove animation class after rotation completes
        setTimeout(() => {
            if (toggleButton) {
                toggleButton.classList.remove('changing');
            }
        }, 600);
    },

    /**
     * Apply theme to document
     * @param {string} theme - Theme to apply ('light' or 'dark')
     * @param {string} previousTheme - Previous theme (optional)
     */
    applyTheme(theme, previousTheme = null) {
        console.log(`ThemeManager: Applying theme: ${theme}`);

        // Add class to prevent transitions during theme change
        document.body.classList.add('theme-changing');

        // Set theme attribute on document
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);

        // Remove transition prevention after brief delay
        setTimeout(() => {
            document.body.classList.remove('theme-changing');
        }, 50);

        // Fire theme change event for other components
        this.notifyThemeChange(theme, previousTheme);
    },

    /**
     * Update meta theme-color for mobile browsers
     * @param {string} theme - Current theme
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }

        const color = theme === 'dark' ? '#000000' : '#ffffff';
        metaThemeColor.setAttribute('content', color);
    },

    /**
     * Notify other components of theme change
     * @param {string} theme - New theme
     */
    notifyThemeChange(theme, previousTheme = null) {
        // Dispatch custom event
        const themeChangeEvent = new CustomEvent('themechange', {
            detail: { theme, previousTheme }
        });
        document.dispatchEvent(themeChangeEvent);

        // Call any registered callbacks
        if (this.onThemeChange && typeof this.onThemeChange === 'function') {
            this.onThemeChange(theme);
        }
    },

    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        return this.currentTheme;
    },

    /**
     * Set theme programmatically
     * @param {string} theme - Theme to set ('light' or 'dark')
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error(`ThemeManager: Invalid theme: ${theme}`);
            return;
        }

        if (theme !== this.currentTheme) {
            const previousTheme = this.currentTheme;
            this.currentTheme = theme;
            this.applyTheme(theme, previousTheme);
            this.saveTheme();
        }
    },

    /**
     * Listen for system theme changes
     */
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (event) => {
            // Only update if user hasn't set a manual preference
            if (!localStorage.getItem(this.storageKey)) {
                const newTheme = event.matches ? 'dark' : 'light';
                this.setTheme(newTheme);
            }
        });
    },

    /**
     * Register theme change callback
     * @param {Function} callback - Function to call on theme change
     */
    onThemeChange: null,

    /**
     * Handle prefers-contrast for accessibility
     */
    handleContrastPreference() {
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

        const handleContrastChange = (event) => {
            if (event.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        };

        // Apply initial state
        handleContrastChange(highContrastQuery);

        // Listen for changes
        highContrastQuery.addEventListener('change', handleContrastChange);
    },

    /**
     * Initialize all theme-related features
     */
    initializeAll() {
        this.init();
        this.watchSystemTheme();
        this.handleContrastPreference();
    }
};

// Don't auto-initialize - let app.js handle it

// Export for use in other modules
window.ThemeManager = ThemeManager;