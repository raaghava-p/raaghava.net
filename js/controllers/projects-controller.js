/**
 * Projects Controller - REDESIGNED
 * 3-wall layout: Each wall displays 2x3 grid of project thumbnails
 */

const ProjectsController = {
    projects: null,

    /**
     * Initialize projects system
     */
    async init() {
        console.log('ProjectsController: Initializing');
        await this.loadProjectsData();
    },

    /**
     * Load projects data from JSON
     */
    async loadProjectsData() {
        try {
            const response = await fetch('content/projects/projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Handle projects as either object or array
            if (data.projects) {
                if (Array.isArray(data.projects)) {
                    // Convert array to object keyed by ID
                    this.projects = {};
                    data.projects.forEach(project => {
                        this.projects[project.id] = project;
                    });
                } else {
                    // Already an object
                    this.projects = data.projects;
                }
            } else {
                this.projects = {};
            }

            console.log('ProjectsController: Loaded', Object.keys(this.projects).length, 'projects');
        } catch (error) {
            console.error('ProjectsController: Failed to load data:', error);
            this.projects = {};
        }
    },

    /**
     * Render projects page with 3-wall layout
     */
    render() {
        console.log('ProjectsController: Rendering');

        if (!this.projects || Object.keys(this.projects).length === 0) {
            this.renderEmptyState();
            return;
        }

        const room = document.getElementById('room');
        if (!room) return;

        // Use 3-wall layout
        room.className = 'room three-wall-layout';

        // Clear all walls
        this.clearAllWalls();

        // Get all projects sorted chronologically (newest first)
        const sortedProjects = Object.values(this.projects).sort((a, b) => {
            return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
        });

        // Divide projects: center gets first 6, left gets next 6, right gets next 6
        const centerProjects = sortedProjects.slice(0, 6);
        const leftProjects = sortedProjects.slice(6, 12);
        const rightProjects = sortedProjects.slice(12, 18);

        // Render walls - center first, then left, then right
        this.renderWallGrid('back', centerProjects, true);  // true = show "more" button
        this.renderWallGrid('left', leftProjects, false);
        this.renderWallGrid('right', rightProjects, false);
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
     * Render a wall with 2x3 project grid
     * @param {string} wallId - Wall identifier ('left', 'back', 'right')
     * @param {Array} projects - Projects to display on this wall
     * @param {boolean} showMoreButton - Whether to show "more" button
     */
    renderWallGrid(wallId, projects, showMoreButton = false) {
        const content = document.getElementById(`${wallId}-content`);
        if (!content) return;

        if (projects.length === 0) {
            content.innerHTML = '<div class="wall-content"></div>';
            return;
        }

        const projectGrid = projects.map(project => {
            const thumbnailUrl = this.getThumbnailUrl(project.id);
            return `
                <div class="project-grid-item" onclick='ProjectsController.openProjectInLightbox("${project.id}")'>
                    <div class="project-thumbnail" style="background-image: url('${thumbnailUrl}')"></div>
                </div>
            `;
        }).join('');

        const moreButton = showMoreButton ? `
            <button class="more-label bottom-right" onclick="ProjectsController.openProjectsGrid()">
                more
            </button>
        ` : '';

        content.innerHTML = `
            <div class="wall-content">
                <div class="project-grid-2x3">
                    ${projectGrid}
                </div>
                ${moreButton}
            </div>
        `;
    },

    /**
     * Get thumbnail URL for project
     * @param {string} projectId - Project ID
     * @returns {string} Thumbnail URL
     */
    getThumbnailUrl(projectId) {
        return `content/projects/${projectId}_thumbnail.webp`;
    },

    /**
     * Open projects grid lightbox (shows all projects)
     */
    openProjectsGrid() {
        // Get all projects sorted chronologically (newest first)
        const sortedProjects = Object.values(this.projects).sort((a, b) => {
            return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
        });

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.openGrid(
                sortedProjects,
                'project',
                'All Projects'
            );
        }
    },

    /**
     * Open project in lightbox
     * @param {string} projectId - Project ID to open
     */
    openProjectInLightbox(projectId) {
        const project = this.projects[projectId];
        if (!project) {
            console.error('ProjectsController: Project not found:', projectId);
            return;
        }

        // Get all projects for navigation
        const sortedProjects = Object.values(this.projects).sort((a, b) => {
            return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
        });

        const index = sortedProjects.findIndex(p => p.id === projectId);

        if (window.UniversalContentLightbox) {
            window.UniversalContentLightbox.open(
                project,
                window.UniversalContentLightbox.ContentTypes.PROJECT,
                sortedProjects,
                index
            );
        }
    },

    /**
     * Render empty state when no projects available
     */
    renderEmptyState() {
        const room = document.getElementById('room');
        if (!room) return;

        room.className = 'room single-wall-layout';

        const backContent = document.getElementById('back-content');
        if (backContent) {
            backContent.innerHTML = `
                <div class="empty-state">
                    <h2>No Projects Available</h2>
                    <p>Check back later for projects.</p>
                </div>
            `;
        }
    }
};

// Export to window for global access
window.ProjectsController = ProjectsController;
