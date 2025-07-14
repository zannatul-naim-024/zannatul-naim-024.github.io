/**
 * Professional Portfolio Navigation System with Theme Toggle
 * Handles smooth scrolling, active navigation highlighting, responsive navigation, and theme switching
 * 
 * @author Zannatul Naim
 * @version 3.0.0
 */

class PortfolioNavigation {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            navbarSelector: '.navbar',
            navMenuSelector: '.nav-menu',
            navLinkSelector: '.nav-menu a',
            sectionSelector: 'section, header',
            activeClass: 'active',
            navbarHeight: 70,
            scrollOffset: 70,
            observerThreshold: 0.4,
            smoothScrollBehavior: 'smooth',
            throttleDelay: 16, // ~60fps
            ...options
        };

        // State management
        this.isScrolling = false;
        this.currentActiveSection = null;
        this.lastScrollTop = 0;
        this.currentTheme = 'dark'; // ALWAYS DEFAULT TO DARK

        // Initialize the navigation system
        this.init();
    }

    /**
     * Initialize the navigation system
     */
    init() {
        try {
            this.cacheDOM();
            this.validateElements();
            this.bindEvents();
            this.initIntersectionObserver();
            this.initMobileNavigation();
            this.initThemeToggle();
            this.setInitialActiveSection();
            this.loadSavedTheme();
            
            console.log('Portfolio Navigation initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Portfolio Navigation:', error);
        }
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheDOM() {
        this.navbar = document.querySelector(this.config.navbarSelector);
        this.navMenu = document.querySelector(this.config.navMenuSelector);
        this.navLinks = document.querySelectorAll(this.config.navLinkSelector);
        this.sections = document.querySelectorAll(this.config.sectionSelector);
        this.themeToggle = document.querySelector('.theme-toggle');
        this.themeIcon = document.querySelector('#theme-icon');
    }

    /**
     * Validate required DOM elements exist
     */
    validateElements() {
        if (!this.navbar) {
            throw new Error(`Navbar not found with selector: ${this.config.navbarSelector}`);
        }
        if (!this.navLinks.length) {
            throw new Error(`Navigation links not found with selector: ${this.config.navLinkSelector}`);
        }
        if (!this.sections.length) {
            throw new Error(`Sections not found with selector: ${this.config.sectionSelector}`);
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Smooth scrolling for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Throttled scroll event for navbar effects
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), this.config.throttleDelay));

        // Handle keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Handle window resize
        window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 250));
    }

    /**
     * Handle navigation link clicks
     * @param {Event} event - Click event
     */
    handleNavClick(event) {
        event.preventDefault();
        
        const targetId = event.currentTarget.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const targetSection = document.querySelector(targetId);
        if (!targetSection) {
            console.warn(`Target section not found: ${targetId}`);
            return;
        }

        this.scrollToSection(targetSection);
        this.setActiveNavLink(event.currentTarget);

        // Close mobile menu if open
        this.closeMobileMenu();
    }

    /**
     * Smooth scroll to a specific section
     * @param {HTMLElement} targetSection - Target section element
     */
    scrollToSection(targetSection) {
        const targetPosition = targetSection.offsetTop - this.config.scrollOffset;
        
        this.isScrolling = true;
        
        window.scrollTo({
            top: targetPosition,
            behavior: this.config.smoothScrollBehavior
        });

        // Reset scrolling flag after animation completes
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);
    }

    /**
     * Handle scroll events for navbar effects
     */
    handleScroll() {
        if (this.isScrolling) return;

        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class to navbar for styling
        if (currentScrollTop > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        this.lastScrollTop = currentScrollTop;
    }

    /**
     * Handle keyboard navigation (accessibility)
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNavigation(event) {
        // Handle Escape key to close mobile menu
        if (event.key === 'Escape') {
            this.closeMobileMenu();
        }
        
        // Handle T key for theme toggle
        if (event.key === 't' || event.key === 'T') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
                this.toggleTheme();
            }
        }
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    /**
     * Initialize Intersection Observer for active section highlighting
     */
    initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: `-${this.config.navbarHeight}px 0px -50% 0px`,
            threshold: this.config.observerThreshold
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isScrolling) {
                    this.updateActiveNavigation(entry.target);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            this.intersectionObserver.observe(section);
        });
    }

    /**
     * Update active navigation based on current section
     * @param {HTMLElement} targetSection - Currently visible section
     */
    updateActiveNavigation(targetSection) {
        if (this.currentActiveSection === targetSection.id) return;

        this.currentActiveSection = targetSection.id;
        const navLink = document.querySelector(`${this.config.navLinkSelector}[href="#${targetSection.id}"]`);
        
        if (navLink) {
            this.setActiveNavLink(navLink);
        }
    }

    /**
     * Set active navigation link
     * @param {HTMLElement} activeLink - Link to set as active
     */
    setActiveNavLink(activeLink) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove(this.config.activeClass);
            link.setAttribute('aria-current', 'false');
        });

        // Add active class to current link
        if (activeLink) {
            activeLink.classList.add(this.config.activeClass);
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    /**
     * Set initial active section based on current scroll position or URL hash
     */
    setInitialActiveSection() {
        // Check if there's a hash in the URL
        const hash = window.location.hash;
        if (hash) {
            const targetSection = document.querySelector(hash);
            const navLink = document.querySelector(`${this.config.navLinkSelector}[href="${hash}"]`);
            
            if (targetSection && navLink) {
                this.setActiveNavLink(navLink);
                // Scroll to section after a short delay to ensure page is loaded
                setTimeout(() => {
                    this.scrollToSection(targetSection);
                }, 100);
                return;
            }
        }

        // Otherwise, set the first section as active
        const firstNavLink = this.navLinks[0];
        if (firstNavLink) {
            this.setActiveNavLink(firstNavLink);
        }
    }

    /**
     * Initialize theme toggle functionality
     */
    initThemeToggle() {
        if (!this.themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Add click event listener
        this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Add keyboard support
        this.themeToggle.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Set the theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn(`Invalid theme: ${theme}. Using 'dark' as default.`);
            theme = 'dark';
        }

        this.currentTheme = theme;
        
        // Update document attribute
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Update theme icon
        this.updateThemeIcon(theme);
        
        // Save theme preference
        this.saveThemePreference(theme);
        
        // Add transition class temporarily
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);

        console.log(`Theme switched to: ${theme}`);
    }

    /**
     * Update the theme toggle icon
     * @param {string} theme - Current theme
     */
    updateThemeIcon(theme) {
        if (!this.themeIcon) return;

        if (theme === 'light') {
            this.themeIcon.className = 'fas fa-moon';
            this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        } else {
            this.themeIcon.className = 'fas fa-sun';
            this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
        }
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - Theme to save
     */
    saveThemePreference(theme) {
        try {
            localStorage.setItem('portfolio-theme', theme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    /**
     * Load saved theme preference - ALWAYS DEFAULTS TO DARK
     */
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('portfolio-theme');
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                this.setTheme(savedTheme);
                return;
            }
        } catch (error) {
            console.warn('Could not load theme preference:', error);
        }

        // ALWAYS DEFAULT TO DARK MODE (no system preference check)
        this.setTheme('dark');
        
        console.log('No saved theme preference found. Defaulting to dark mode.');
    }

    /**
     * Initialize mobile navigation functionality
     */
    initMobileNavigation() {
        // Create mobile menu toggle if it doesn't exist
        let mobileToggle = this.navbar.querySelector('.mobile-toggle');
        
        if (!mobileToggle) {
            mobileToggle = this.createMobileToggle();
            this.navbar.querySelector('.container').appendChild(mobileToggle);
        }

        // Add event listener for mobile toggle
        mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));

        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!this.navbar.contains(event.target)) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu when clicking the close button
        if (this.navMenu) {
            this.navMenu.addEventListener('click', (event) => {
                if (event.target === this.navMenu && event.target.classList.contains('mobile-open')) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    /**
     * Create mobile menu toggle button
     * @returns {HTMLElement} Mobile toggle button
     */
    createMobileToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        return toggle;
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const mobileToggle = this.navbar.querySelector('.mobile-toggle');
        const isOpen = this.navMenu.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const mobileToggle = this.navbar.querySelector('.mobile-toggle');
        this.navMenu.classList.add('mobile-open');
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'true');
        }
        document.body.classList.add('nav-open');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const mobileToggle = this.navbar.querySelector('.mobile-toggle');
        this.navMenu.classList.remove('mobile-open');
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('nav-open');
    }

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Destroy the navigation system and clean up event listeners
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Remove event listeners
        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });
        
        if (this.themeToggle) {
            this.themeToggle.removeEventListener('click', this.toggleTheme);
        }
        
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
        
        console.log('Portfolio Navigation destroyed');
    }
}

// Initialize the navigation system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with custom configuration if needed
    const portfolioNav = new PortfolioNavigation({
        // You can override defaults here
        // navbarHeight: 80,
        // scrollOffset: 80,
        // observerThreshold: 0.5
    });

    // Make instance globally accessible for debugging
    window.portfolioNavigation = portfolioNav;
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioNavigation;
}
