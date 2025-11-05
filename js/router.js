/**
 * Router System - Hash-based Navigation for Museum Rooms
 * Handles URL routing, navigation history, and room transitions
 */

const Router = {
    // Current route state
    currentRoute: '',
    previousRoute: '',
    navigationHistory: [],

    // Route definitions - Maps hash routes to content configuration
    routes: {
        '': {
            title: 'Personal Museum',
            backWall: { type: 'photo-space', content: '' },
            leftWall: { type: 'navigation', content: 'WORKS', route: '/works', label: 'navigate' },
            rightWall: { type: 'navigation', content: 'ABOUT', route: '/about', label: 'navigate' }
        },
        '/about': {
            title: 'About - Personal Museum',
            backWall: { type: 'placeholder', content: 'ABOUT' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works': {
            title: 'Works - Personal Museum',
            backWall: { type: 'section-title', content: 'WORKS' },
            leftWall: { type: 'navigation', content: 'PERSONAL', route: '/works/personal', label: 'navigate' },
            rightWall: { type: 'navigation', content: 'CURATED', route: '/works/curated', label: 'navigate' }
        },
        '/works/personal': {
            title: 'Personal Works - Museum',
            layout: 'four-walls',
            heading: 'Personal Works',
            leftmostWall: { type: 'navigation', content: 'PHOTOGRAPHY', route: '/works/personal/photography', label: 'view' },
            leftmiddleWall: { type: 'navigation', content: 'WRITINGS', route: '/works/personal/writings', label: 'read' },
            rightmiddleWall: { type: 'navigation', content: 'MUSIC', route: '/works/personal/music', label: 'listen' },
            rightmostWall: { type: 'navigation', content: 'PROJECTS', route: '/works/personal/projects', label: 'explore' }
        },
        '/works/personal/writings': {
            title: 'Personal Writings - Museum',
            backWall: { type: 'placeholder', content: 'WRITINGS' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/personal/photography': {
            title: 'Photography - Museum',
            backWall: { type: 'placeholder', content: 'PHOTOGRAPHY' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/curated': {
            title: 'Curated Works - Museum',
            layout: 'four-walls',
            heading: 'Curated Works',
            leftmostWall: { type: 'navigation', content: 'WRITINGS', route: '/works/curated/writings', label: 'read' },
            leftmiddleWall: { type: 'navigation', content: 'CINEMA & TV', route: '/works/curated/cinema', label: 'watch' },
            rightmiddleWall: { type: 'navigation', content: 'MUSIC', route: '/works/curated/music', label: 'listen' },
            rightmostWall: { type: 'navigation', content: 'MISCELLANEOUS', route: '/works/curated/misc', label: 'explore' }
        },
        '/works/curated/writings': {
            title: 'Curated Writings - Museum',
            backWall: { type: 'placeholder', content: 'CURATED WRITINGS' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/curated/cinema': {
            title: 'Cinema & TV - Museum',
            backWall: { type: 'placeholder', content: 'CINEMA & TV' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/curated/music': {
            title: 'Curated Music - Museum',
            backWall: { type: 'placeholder', content: 'CURATED MUSIC' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/curated/misc': {
            title: 'Miscellaneous - Museum',
            backWall: { type: 'placeholder', content: 'MISCELLANEOUS' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/personal/music': {
            title: 'Personal Music - Museum',
            backWall: { type: 'placeholder', content: 'MUSIC' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        },
        '/works/personal/projects': {
            title: 'Projects - Museum',
            backWall: { type: 'placeholder', content: 'PROJECTS' },
            leftWall: { type: 'empty' },
            rightWall: { type: 'empty' }
        }
    },

    // Central navigation tree powering sitemap and other navigation UIs
    navigationTree: [
        {
            label: 'ENTRANCE',
            route: '',
            description: 'Return to the main hall'
        },
        {
            label: 'ABOUT & CONTACT',
            route: '/about'
        },
        {
            label: 'WORKS',
            route: '/works',
            children: [
                {
                    label: 'Personal Works',
                    route: '/works/personal',
                    children: [
                        {
                            label: 'Photography',
                            route: '/works/personal/photography',
                            description: 'Photo collection'
                        },
                        {
                            label: 'Writings',
                            route: '/works/personal/writings',
                            description: 'Articles and essays'
                        },
                        {
                            label: 'Music',
                            route: '/works/personal/music',
                            description: 'Music collection'
                        },
                        {
                            label: 'Projects',
                            route: '/works/personal/projects',
                            description: 'Project portfolio'
                        }
                    ]
                },
                {
                    label: 'Curated Works',
                    route: '/works/curated',
                    children: [
                        {
                            label: 'Curated Writings',
                            route: '/works/curated/writings',
                            description: 'Curated reading list • Recommendations'
                        },
                        {
                            label: 'Cinema & TV',
                            route: '/works/curated/cinema',
                            description: 'Curated watch list • Reviews'
                        },
                        {
                            label: 'Curated Music',
                            route: '/works/curated/music',
                            description: 'Curated discographies • Reviews'
                        },
                        {
                            label: 'Miscellaneous',
                            route: '/works/curated/misc',
                            description: 'Various acategorous works'
                        }
                    ]
                }
            ]
        }
    ],

    /**
     * Initialize router - Set up event listeners and handle initial route
     */
    init() {
        console.log('Router: Initializing');

        // Listen for hash changes (back/forward browser buttons)
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // Listen for popstate (browser navigation)
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.route) {
                this.navigateTo(event.state.route, false); // Don't push to history
            }
        });

        // Initialize theme integration
        this.initThemeIntegration();

        // Handle initial route on page load with small delay to ensure all systems ready
        setTimeout(() => {
            this.handleRoute();
        }, 50);
    },

    /**
     * Provide a deep copy of the navigation tree for consumers
     * @returns {Array<Object>} Navigation tree data
     */
    getNavigationTree() {
        return JSON.parse(JSON.stringify(this.navigationTree));
    },

    /**
     * Navigate to a specific route
     * @param {string} route - The route to navigate to (e.g., '/works/personal')
     * @param {boolean} addToHistory - Whether to add to browser history
     * @param {string} clickedWall - Which wall was clicked ('left', 'right', 'back')
     */
    navigateTo(route, addToHistory = true, clickedWall = null) {
        console.log(`Router: Navigating to ${route} via ${clickedWall} wall`);

        // Store previous route for transitions
        this.previousRoute = this.currentRoute;
        this.currentRoute = route;
        this.lastClickedWall = clickedWall;

        // Add to navigation history
        this.navigationHistory.push(route);

        // Update browser history and URL
        if (addToHistory) {
            const fullURL = window.location.pathname + '#' + route;
            window.history.pushState({ route }, '', fullURL);
        }

        // Update page title
        const routeConfig = this.routes[route];
        if (routeConfig) {
            document.title = routeConfig.title;
        }

        // Trigger route rendering
        this.renderRoute(route);
    },

    /**
     * Handle current hash route
     */
    handleRoute() {
        const hash = window.location.hash.substring(1); // Remove #
        const route = hash || ''; // Default to home if no hash

        console.log(`Router: Handling route "${route}", current: "${this.currentRoute}"`);

        // Always navigate on first load (when currentRoute is empty and route is empty)
        // or when route actually changed
        if (route !== this.currentRoute || this.currentRoute === '') {
            this.navigateTo(route, false); // Don't add to history (already in URL)
        }
    },

    /**
     * Handle routes that use controllers
     * @param {string} route - Route to check
     * @returns {boolean} True if controller handled the route
     */
    async handleControllerRoute(route) {
        // About route
        if (route === '/about') {
            if (window.AboutController) {
                await window.AboutController.init();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Photography routes
        if (route === '/works/personal/photography') {
            if (window.PhotographyController) {
                await window.PhotographyController.init();
                window.PhotographyController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Photography collection routes (e.g., /photography/street)
        if (route.startsWith('/photography/')) {
            const collectionId = route.split('/')[2];
            if (window.PhotographyController) {
                window.PhotographyController.render(collectionId);
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Writings routes
        if (route === '/works/personal/writings') {
            if (window.WritingsController) {
                window.WritingsController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Music routes
        if (route === '/works/personal/music') {
            if (window.MusicController) {
                window.MusicController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Projects routes
        if (route === '/works/personal/projects') {
            if (window.ProjectsController) {
                window.ProjectsController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Writings routes
        if (route === '/works/curated/writings') {
            if (window.CuratedWritingsController) {
                window.CuratedWritingsController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Writings collection routes (e.g., /works/curated/writings/books)
        if (route.startsWith('/works/curated/writings/')) {
            const collectionId = route.split('/')[4];
            if (window.CuratedWritingsController) {
                window.CuratedWritingsController.render(collectionId);
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Cinema routes
        if (route === '/works/curated/cinema') {
            if (window.CuratedCinemaController) {
                window.CuratedCinemaController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Cinema collection routes (e.g., /works/curated/cinema/films)
        if (route.startsWith('/works/curated/cinema/')) {
            const collectionId = route.split('/')[4];
            if (window.CuratedCinemaController) {
                window.CuratedCinemaController.render(collectionId);
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Music routes
        if (route === '/works/curated/music') {
            if (window.CuratedMusicController) {
                window.CuratedMusicController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Music collection routes (e.g., /works/curated/music/albums)
        if (route.startsWith('/works/curated/music/')) {
            const collectionId = route.split('/')[4];
            if (window.CuratedMusicController) {
                window.CuratedMusicController.render(collectionId);
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Misc routes
        if (route === '/works/curated/misc') {
            if (window.CuratedMiscController) {
                window.CuratedMiscController.render();
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        // Curated Misc collection routes (e.g., /works/curated/misc/podcasts)
        if (route.startsWith('/works/curated/misc/')) {
            const collectionId = route.split('/')[4];
            if (window.CuratedMiscController) {
                window.CuratedMiscController.render(collectionId);
                this.updateBackButton();
                this.updateHierarchyIndicator(route);
                return true;
            }
        }

        return false; // Route not handled by controller
    },

    /**
     * Render the current route configuration
     * @param {string} route - Route to render
     */
    async renderRoute(route) {
        const routeConfig = this.routes[route];

        if (!routeConfig) {
            console.error(`Router: Route not found: ${route}`);
            this.show404();
            return;
        }

        console.log(`Router: Rendering route ${route}`, routeConfig);

        // ALWAYS clear walls first, before any rendering
        this.clearAllWalls();

        // Check if this route should be handled by a controller
        if (await this.handleControllerRoute(route)) {
            return; // Controller handled the routing
        }

        // Add transition class to room
        const room = document.getElementById('room');

        // Clear previous view classes
        room.classList.remove('view-left', 'view-right', 'view-back', 'move-forward', 'new-room-enter', 'four-walls');
        room.classList.add('room-transition');

        // Determine layout type and add appropriate class
        if (routeConfig.layout === 'four-walls') {
            room.classList.add('four-walls');
        }

        // Determine view orientation
        const viewClass = this.getViewClass();
        if (viewClass) {
            room.classList.add(viewClass);
        }

        // Handle forward navigation differently (two-stage animation)
        if (viewClass === 'move-forward') {
            // Stage 1: Move forward into the wall
            setTimeout(() => {
                // Stage 2: Transform into new room
                room.classList.remove('move-forward');
                room.classList.add('new-room-enter');

                // Render walls using shared method
                this.renderWallsForRoute(routeConfig);

                // Final cleanup
                setTimeout(() => {
                    room.classList.remove('room-transition', 'new-room-enter');
                    this.updateBackButton();
                    this.updateHierarchyIndicator(route);
                }, 150);

            }, 100); // Allow forward movement to complete
        } else {
            // Standard navigation
            setTimeout(() => {
                // Render walls using shared method
                this.renderWallsForRoute(routeConfig);

                // Remove transition classes after animation
                setTimeout(() => {
                    room.classList.remove('room-transition');
                    this.updateBackButton();
                    this.updateHierarchyIndicator(route);
                }, 100);

            }, 25);
        }
    },

    /**
     * Shared method to render walls for a given route configuration
     * @param {Object} routeConfig - Route configuration object
     */
    renderWallsForRoute(routeConfig) {
        if (routeConfig.layout === 'four-walls') {
            this.renderWall('leftmost', routeConfig.leftmostWall);
            this.renderWall('leftmiddle', routeConfig.leftmiddleWall);
            this.renderWall('rightmiddle', routeConfig.rightmiddleWall);
            this.renderWall('rightmost', routeConfig.rightmostWall);

            // Add section heading if specified
            if (routeConfig.heading) {
                this.addSectionHeading(routeConfig.heading);
            }
        } else {
            // Standard 3-wall layout
            this.renderWall('back', routeConfig.backWall);
            this.renderWall('left', routeConfig.leftWall);
            this.renderWall('right', routeConfig.rightWall);
            // Clear 4-wall elements
            this.renderWall('leftmost', { type: 'empty' });
            this.renderWall('leftmiddle', { type: 'empty' });
            this.renderWall('rightmiddle', { type: 'empty' });
            this.renderWall('rightmost', { type: 'empty' });
        }
        // Always clear front wall to prevent flashing
        this.renderWall('front', { type: 'empty' });

        // Add main page header only for homepage
        this.updateMainPageHeader(this.currentRoute);
    },

    /**
     * Add section heading to four-wall layout
     * @param {string} headingText - Text for the heading
     */
    addSectionHeading(headingText) {
        const room = document.getElementById('room');

        // Remove any existing section heading
        const existingHeading = room.querySelector('.section-heading');
        if (existingHeading) {
            existingHeading.remove();
        }

        // Create new heading element
        const headingElement = document.createElement('div');
        headingElement.className = 'section-heading';
        headingElement.innerHTML = `<h1>${headingText}</h1>`;

        room.appendChild(headingElement);
    },

    /**
     * Update main page header - only show on homepage
     * @param {string} route - Current route string
     */
    updateMainPageHeader(route) {
        const room = document.getElementById('room');

        // Always remove any existing main page header first
        const existingHeader = room.querySelector('.main-page-header');
        if (existingHeader) {
            existingHeader.remove();
        }

        // Only add header for main page (empty route) - be very strict about this check
        console.log('updateMainPageHeader called with route:', JSON.stringify(route), 'type:', typeof route);
        if (route === '') {
            console.log('Adding main page header for home route');
            const headerElement = document.createElement('div');
            headerElement.className = 'main-page-header';
            headerElement.innerHTML = '<h1>raaghava.net</h1>';
            room.appendChild(headerElement);
        } else {
            console.log('Not adding header - route is not empty string:', route);
        }
    },

    /**
     * Clear all wall content immediately to prevent flashing
     */
    clearAllWalls() {
        const walls = ['back', 'left', 'right', 'front', 'leftmost', 'leftmiddle', 'rightmiddle', 'rightmost'];
        walls.forEach(wall => {
            const wallElement = document.querySelector(`.${wall}-wall .content-frame`);
            if (wallElement) {
                wallElement.innerHTML = '';
                wallElement.parentElement.style.cursor = 'default';
                wallElement.parentElement.onclick = null;
                wallElement.parentElement.classList.remove('wall-has-button');
                wallElement.parentElement.removeAttribute('data-route');
            }
        });

        // Also clear any existing section heading
        const existingHeading = document.querySelector('.section-heading');
        if (existingHeading) {
            existingHeading.remove();
        }

        // Also clear any existing main page header
        const existingMainHeader = document.querySelector('.main-page-header');
        if (existingMainHeader) {
            existingMainHeader.remove();
        }
    },

    /**
     * Determine which view to use based on navigation pattern
     * @returns {string} CSS class for view orientation
     */
    getViewClass() {
        // Check if this is a forward navigation (hierarchical movement)
        if (this.isForwardNavigation()) {
            return 'move-forward';
        }

        // For direct clicks on side walls (final destinations)
        // Exclude About section from perspective views - it should have normal layout
        if (this.currentRoute !== '/about') {
            if (this.lastClickedWall === 'left' && this.isLeafRoute()) {
                return 'view-left';
            } else if (this.lastClickedWall === 'right' && this.isLeafRoute()) {
                return 'view-right';
            }
        }

        // Default: show the new room layout
        return '';
    },

    /**
     * Check if this is a forward navigation into a new hierarchical level
     * @returns {boolean}
     */
    isForwardNavigation() {
        if (!this.previousRoute || !this.currentRoute) return false;

        // Moving from shorter to longer path = going deeper
        const prevDepth = this.previousRoute.split('/').length;
        const currDepth = this.currentRoute.split('/').length;

        return currDepth > prevDepth;
    },

    /**
     * Check if current route is a leaf (final destination) with content
     * @returns {boolean}
     */
    isLeafRoute() {
        const routeConfig = this.routes[this.currentRoute];
        if (!routeConfig) return false;

        // A leaf route has content on back wall, not just navigation
        return routeConfig.backWall &&
               !['empty', 'section-title', 'photo-space'].includes(routeConfig.backWall.type);
    },

    /**
     * Render content for a specific wall
     * @param {string} wall - Wall position ('back', 'left', 'right', 'front')
     * @param {Object} config - Wall configuration object
     */
    renderWall(wall, config) {
        const wallElement = document.querySelector(`.${wall}-wall .content-frame`);

        if (!config || config.type === 'empty') {
            wallElement.innerHTML = '';
            wallElement.parentElement.style.cursor = 'default';
            wallElement.parentElement.onclick = null;
            wallElement.parentElement.classList.remove('wall-has-button');
            wallElement.parentElement.removeAttribute('data-route');

            // Hide front wall if not used
            if (wall === 'front') {
                wallElement.parentElement.style.display = 'none';
            }
            return;
        }

        // Show front wall if being used
        if (wall === 'front') {
            wallElement.parentElement.style.display = 'block';
        }

        // Add content based on type
        switch (config.type) {
            case 'navigation':
                this.renderNavigationWall(wallElement, config);
                break;
            case 'content':
                this.renderContentWall(wallElement, config);
                break;
            case 'artwork':
                this.renderArtworkWall(wallElement, config);
                break;
            case 'blog-list':
                this.renderBlogListWall(wallElement, config);
                break;
            case 'gallery':
                this.renderGalleryWall(wallElement, config);
                break;
            case 'photo-space':
                this.renderPhotoSpaceWall(wallElement, config).catch(error => {
                    console.error('Error rendering photo space:', error);
                    // Fallback to placeholder if photo space fails
                    this.renderPlaceholderWall(wallElement, { content: 'PHOTO SPACE ERROR' });
                });
                break;
            case 'section-title':
                this.renderSectionTitleWall(wallElement, config);
                break;
            case 'placeholder':
                this.renderPlaceholderWall(wallElement, config);
                break;
            default:
                console.warn(`Router: Unknown wall type: ${config.type}`);
        }
    },

    /**
     * Render navigation wall with clickable route
     */
    renderNavigationWall(element, config) {
        element.innerHTML = '';

        const wall = element.parentElement;
        const wallType = wall.classList.contains('left-wall') ? 'left' :
                        wall.classList.contains('right-wall') ? 'right' :
                        wall.classList.contains('front-wall') ? 'front' : 'back';

        wall.classList.add('wall-has-button');
        wall.dataset.route = config.route || '';

        const labelText = config.label !== undefined ? config.label : config.content.toLowerCase();
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wall-button';
        button.dataset.route = config.route || '';
        button.setAttribute('aria-label', config.ariaLabel || `Navigate to ${config.content}`);

        const title = document.createElement('span');
        title.className = 'wall-title';
        title.textContent = config.content;
        button.appendChild(title);

        if (labelText) {
            const label = document.createElement('span');
            label.className = 'museum-label wall-label';
            label.textContent = labelText;
            button.appendChild(label);
        }

        const activate = (event) => {
            event.preventDefault();
            if (config.route) {
                this.navigateTo(config.route, true, wallType);
            }
        };

        button.addEventListener('click', activate);
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                activate(event);
            }
        });

        element.appendChild(button);

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 200);
    },

    /**
     * Render static content wall
     */
    renderContentWall(element, config) {
        // This will be handled by ContentLoader
        element.innerHTML = `
            <h3>Loading content...</h3>
        `;

        // Load content asynchronously
        if (window.ContentLoader) {
            window.ContentLoader.loadContent(config.content, element);
        }
    },

    /**
     * Render artwork display wall
     */
    renderArtworkWall(element, config) {
        element.innerHTML = `
            <h1>${config.content}</h1>
            <div class="museum-label">personal museum</div>
        `;

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 200);
    },

    /**
     * Render blog list wall
     */
    renderBlogListWall(element, config) {
        element.innerHTML = `
            <h3>Loading writings...</h3>
        `;

        // Load blog list asynchronously
        if (window.ContentLoader) {
            window.ContentLoader.loadBlogList(element);
        }
    },

    /**
     * Render gallery wall
     */
    renderGalleryWall(element, config) {
        element.innerHTML = `
            <h3>Loading gallery...</h3>
        `;

        // Load gallery asynchronously
        if (window.ContentLoader) {
            window.ContentLoader.loadGallery(config.content, element);
        }
    },

    /**
     * Show 404 error page
     */
    show404() {
        const room = document.getElementById('room');
        const backWall = room.querySelector('.back-wall .content-frame');

        backWall.innerHTML = `
            <h2>Room Not Found</h2>
            <p>This room doesn't exist in the museum.</p>
            <button onclick="Router.navigateTo('')" class="control-btn">
                Return to Entrance
            </button>
        `;
    },

    /**
     * Go back to previous route
     */
    goBack() {
        console.log('Router: Going back from:', this.currentRoute);

        // Determine parent route based on sitemap hierarchy
        const parentRoute = this.getParentRoute(this.currentRoute);

        console.log('Router: Navigating up to parent:', parentRoute);
        this.navigateTo(parentRoute, true);
    },

    /**
     * Get parent route in sitemap hierarchy
     * @param {string} currentRoute - Current route path
     * @returns {string} Parent route path
     */
    getParentRoute(currentRoute) {
        // Home page has no parent
        if (currentRoute === '') {
            return '';
        }

        // Define sitemap hierarchy
        const hierarchy = {
            '/about': '',                          // About → Home
            '/works': '',                          // Works → Home
            '/works/personal': '/works',           // Personal Works → Works
            '/works/curated': '/works',            // Curated Works → Works
            '/works/personal/photography': '/works/personal',
            '/works/personal/writings': '/works/personal',
            '/works/personal/music': '/works/personal',
            '/works/personal/projects': '/works/personal',
            '/works/curated/writings': '/works/curated',
            '/works/curated/cinema': '/works/curated',
            '/works/curated/music': '/works/curated',
            '/works/curated/misc': '/works/curated'
        };

        // Return parent route or home if not found
        return hierarchy[currentRoute] || '';
    },

    /**
     * Update back button visibility and state
     */
    updateBackButton() {
        const backBtn = document.getElementById('back-btn');
        if (!backBtn) return;

        // Back button is enabled everywhere except home page
        const canGoBack = this.currentRoute !== '';
        const parentRoute = this.getParentRoute(this.currentRoute);

        if (canGoBack) {
            backBtn.style.opacity = '1';
            backBtn.disabled = false;
            backBtn.style.cursor = 'pointer';

            // Dynamic label based on where back will go
            const parentName = this.getRouteDisplayName(parentRoute);
            backBtn.setAttribute('aria-label', `Go back to ${parentName}`);
            backBtn.setAttribute('title', `Go back to ${parentName}`);
        } else {
            backBtn.style.opacity = '0.3';
            backBtn.disabled = true;
            backBtn.style.cursor = 'not-allowed';
            backBtn.setAttribute('aria-label', 'Back (you are at home)');
            backBtn.setAttribute('title', 'Back (you are at home)');
        }

        console.log(`Router: Updated back button. Current: "${this.currentRoute}", Parent: "${parentRoute}", Can go back: ${canGoBack}`);
    },

    /**
     * Get display name for a route
     * @param {string} route - Route path
     * @returns {string} Human readable route name
     */
    getRouteDisplayName(route) {
        const names = {
            '': 'Home',
            '/about': 'About',
            '/works': 'Works',
            '/works/personal': 'Personal Works',
            '/works/curated': 'Curated Works',
            '/works/personal/photography': 'Photography',
            '/works/personal/writings': 'Writings',
            '/works/personal/music': 'Music',
            '/works/personal/projects': 'Projects',
            '/works/curated/writings': 'Curated Writings',
            '/works/curated/cinema': 'Cinema & TV',
            '/works/curated/music': 'Curated Music',
            '/works/curated/misc': 'Miscellaneous'
        };

        return names[route] || 'Previous Page';
    },

    /**
     * Get current route path
     * @returns {string} Current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    },

    /**
     * Get route configuration
     * @param {string} route - Route to get config for
     * @returns {Object} Route configuration
     */
    getRouteConfig(route) {
        return this.routes[route];
    },

    /**
     * Get theme-aware filename for featured image
     * @param {Object|string} filename - Either string or object with light/dark variants
     * @param {string} theme - Current theme ('light' or 'dark')
     * @returns {string} The appropriate filename for the theme
     */
    getThemeFilename(filename, theme = 'light') {
        if (typeof filename === 'string') {
            // Legacy format - just return the filename
            return filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        } else if (typeof filename === 'object' && filename[theme]) {
            // New format - return theme-specific filename
            return filename[theme];
        } else if (typeof filename === 'object' && filename.light) {
            // Fallback to light version if theme not available
            return filename.light;
        }
        return '';
    },

    /**
     * Render photo space wall - Display featured image with theme support
     */
    async renderPhotoSpaceWall(element, config) {
        try {
            // Load photos data to get featured image (disable cache to ensure fresh data)
            const response = await fetch('content/photos/photos.json', {
                cache: 'no-cache'
            });
            if (!response.ok) throw new Error('No photos data found');

            const photosData = await response.json();

            if (photosData.featured && photosData.featured.filename) {
                const featured = photosData.featured;
                // Get current theme, fallback to light theme
                let currentTheme = 'light';
                if (window.ThemeManager && typeof window.ThemeManager.getCurrentTheme === 'function') {
                    currentTheme = window.ThemeManager.getCurrentTheme();
                }
                const baseName = this.getThemeFilename(featured.filename, currentTheme);

                if (baseName) {
                    // Generate proper museum label using the museum label generator
                    const museumLabel = window.MuseumLabelGenerator ?
                        window.MuseumLabelGenerator.generatePhotoLabel(featured) :
                        `<div class="museum-label">
                            <div class="label-title">${featured.title}</div>
                            <div class="label-year">${featured.year}</div>
                            ${featured.medium ? `<div class="label-medium">${featured.medium}</div>` : ''}
                            ${featured.dimensions ? `<div class="label-dimensions">${featured.dimensions}</div>` : ''}
                            ${featured.description ? `<div class="label-description">${featured.description}</div>` : ''}
                            ${featured.location ? `<div class="label-location">${featured.location}</div>` : ''}
                        </div>`;

                    element.innerHTML = `
                        <div class="photo-space">
                            <picture class="featured-image" id="featured-picture">
                                <source srcset="content/photos/web/${baseName}.webp" type="image/webp">
                                <img src="content/photos/web/${baseName}.png"
                                     alt="${featured.title}"
                                     onerror="this.parentElement.parentElement.innerHTML='<div class=\\'photo-placeholder\\'><p>[ Featured Image Not Found ]</p></div>'">
                            </picture>
                            ${museumLabel}
                        </div>
                    `;

                    // Store featured data for theme switching
                    this.featuredImageData = featured;
                } else {
                    throw new Error('No valid filename found');
                }
            } else {
                // Fallback to placeholder if no featured image
                element.innerHTML = `
                    <div class="photo-space">
                        <div class="photo-placeholder">
                            <p>[ Photo Space ]</p>
                            <small>Add your featured image to photos.json</small>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading featured image:', error);
            element.innerHTML = `
                <div class="photo-space">
                    <div class="photo-placeholder">
                        <p>[ Photo Space ]</p>
                        <small>Upload your featured image here</small>
                    </div>
                </div>
            `;
        }

        // Make wall non-clickable
        const wall = element.parentElement;
        wall.style.cursor = 'default';
        wall.onclick = null;

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 200);
    },

    /**
     * Update featured image when theme changes
     * @param {string} theme - New theme ('light' or 'dark')
     */
    updateFeaturedImageTheme(theme) {
        const pictureElement = document.getElementById('featured-picture');

        if (pictureElement && this.featuredImageData) {
            const baseName = this.getThemeFilename(this.featuredImageData.filename, theme);

            if (baseName) {
                // Update both source and img elements
                const source = pictureElement.querySelector('source');
                const img = pictureElement.querySelector('img');

                if (source) {
                    source.srcset = `content/photos/web/${baseName}.webp`;
                }
                if (img) {
                    img.src = `content/photos/web/${baseName}.png`;
                }
            }
        }
    },

    /**
     * Render section title wall - Shows current section name
     */
    renderSectionTitleWall(element, config) {
        element.innerHTML = `
            <h1>${config.content}</h1>
        `;

        // Make wall non-clickable
        const wall = element.parentElement;
        wall.style.cursor = 'default';
        wall.onclick = null;

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 200);
    },

    /**
     * Render placeholder wall - Coming soon content
     */
    renderPlaceholderWall(element, config) {
        element.innerHTML = `
            <h1>${config.content}</h1>
            <p>Coming Soon</p>
            <div class="museum-label">awaiting implementation</div>
        `;

        // Make wall non-clickable
        const wall = element.parentElement;
        wall.style.cursor = 'default';
        wall.onclick = null;

        element.classList.add('content-enter');
        setTimeout(() => {
            element.classList.remove('content-enter');
        }, 200);
    },

    /**
     * Generate sitemap for navigation
     * @returns {Array} Sitemap structure
     */
    generateSitemap() {
        const sitemap = [];

        for (const [route, config] of Object.entries(this.routes)) {
            sitemap.push({
                route,
                title: config.title,
                depth: route.split('/').length - 1
            });
        }

        return sitemap.sort((a, b) => {
            // Sort by route path for logical hierarchy
            return a.route.localeCompare(b.route);
        });
    },

    /**
     * Initialize Router system and theme integration
     */
    initThemeIntegration() {
        // Set up theme change listener for featured image updates
        document.addEventListener('themechange', (event) => {
            const newTheme = event.detail.theme;
            this.updateFeaturedImageTheme(newTheme);
        });
    },

    /**
     * Update hierarchy indicator based on current route
     * @param {string} route - Current route path
     */
    updateHierarchyIndicator(route) {
        const hierarchyIndicator = document.getElementById('hierarchy-indicator');
        const hierarchyPath = document.getElementById('hierarchy-path');

        if (!hierarchyIndicator || !hierarchyPath) {
            return;
        }

        // Hide indicator on homepage
        if (route === '') {
            hierarchyIndicator.classList.add('home-page');
            return;
        }

        // Show indicator and remove home-page class
        hierarchyIndicator.classList.remove('home-page');

        // Convert route to display path
        let displayPath = route;

        // Clean up the path for display
        if (displayPath.startsWith('/')) {
            displayPath = displayPath;
        } else {
            displayPath = '/' + displayPath;
        }

        // Update the path text
        hierarchyPath.textContent = displayPath;

        console.log(`Router: Updated hierarchy indicator to "${displayPath}"`);
    }
};

// Export for use in other modules
window.Router = Router;
