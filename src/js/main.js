/**
 * Professional Portfolio Navigation System with Theme Toggle
 * Handles smooth scrolling, active navigation highlighting, responsive navigation, and theme switching
 *
 * @author Zannatul Naim
 * @version 3.0.0
 */

class PortfolioNavigation {
  constructor(options = {}) {
    this.config = {
      navbarSelector: ".navbar",
      navMenuSelector: ".nav-menu",
      navLinkSelector: ".nav-menu a",
      sectionSelector: "section, header",
      activeClass: "active",
      navbarHeight: 70,
      scrollOffset: 70,
      observerThreshold: 0.4,
      smoothScrollBehavior: "smooth",
      throttleDelay: 16,
      ...options,
    };
    this.isScrolling = false;
    this.currentActiveSection = null;
    this.lastScrollTop = 0;
    this.currentTheme = "dark";
    this.init();
  }

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
    } catch (error) {
      console.error("Failed to initialize Portfolio Navigation:", error);
    }
  }

  cacheDOM() {
    this.navbar = document.querySelector(this.config.navbarSelector);
    this.navMenu = document.querySelector(this.config.navMenuSelector);
    this.navLinks = document.querySelectorAll(this.config.navLinkSelector);
    this.sections = document.querySelectorAll(this.config.sectionSelector);
    this.themeToggle = document.querySelector(".theme-toggle");
    this.themeIcon = document.querySelector("#theme-icon");
  }

  validateElements() {
    if (!this.navbar) throw new Error(`Navbar not found: ${this.config.navbarSelector}`);
    if (!this.navLinks.length) throw new Error(`Navigation links not found`);
    if (!this.sections.length) throw new Error(`Sections not found`);
  }

  bindEvents() {
    this.navLinks.forEach((link) => link.addEventListener("click", this.handleNavClick.bind(this)));
    window.addEventListener("scroll", this.throttle(this.handleScroll.bind(this), this.config.throttleDelay));
    document.addEventListener("keydown", this.handleKeyboardNavigation.bind(this));
    window.addEventListener("resize", this.throttle(this.handleResize.bind(this), 250));
  }

  handleNavClick(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;
    this.scrollToSection(targetSection);
    this.setActiveNavLink(event.currentTarget);
    this.closeMobileMenu();
  }

  scrollToSection(targetSection) {
    const targetPosition = targetSection.offsetTop - this.config.scrollOffset;
    this.isScrolling = true;
    window.scrollTo({ top: targetPosition, behavior: this.config.smoothScrollBehavior });
    setTimeout(() => (this.isScrolling = false), 1000);
  }

  handleScroll() {
    if (this.isScrolling) return;
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScrollTop > 50) this.navbar.classList.add("scrolled");
    else this.navbar.classList.remove("scrolled");
    this.lastScrollTop = currentScrollTop;
  }

  handleKeyboardNavigation(event) {
    if (event.key === "Escape") this.closeMobileMenu();
    if ((event.key === "t" || event.key === "T") && !event.ctrlKey && !event.altKey && !event.metaKey) this.toggleTheme();
  }

  handleResize() {
    if (window.innerWidth > 768) this.closeMobileMenu();
  }

  initIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isScrolling) this.updateActiveNavigation(entry.target);
        });
      },
      { root: null, rootMargin: `-${this.config.navbarHeight}px 0px -50% 0px`, threshold: this.config.observerThreshold }
    );
    this.sections.forEach((section) => this.intersectionObserver.observe(section));
  }

  updateActiveNavigation(targetSection) {
    if (this.currentActiveSection === targetSection.id) return;
    this.currentActiveSection = targetSection.id;
    const navLink = document.querySelector(`${this.config.navLinkSelector}[href="#${targetSection.id}"]`);
    if (navLink) this.setActiveNavLink(navLink);
  }

  setActiveNavLink(activeLink) {
    this.navLinks.forEach((link) => {
      link.classList.remove(this.config.activeClass);
      link.setAttribute("aria-current", "false");
    });
    if (activeLink) {
      activeLink.classList.add(this.config.activeClass);
      activeLink.setAttribute("aria-current", "page");
    }
  }

  setInitialActiveSection() {
    const hash = window.location.hash;
    if (hash) {
      const targetSection = document.querySelector(hash);
      const navLink = document.querySelector(`${this.config.navLinkSelector}[href="${hash}"]`);
      if (targetSection && navLink) {
        this.setActiveNavLink(navLink);
        setTimeout(() => this.scrollToSection(targetSection), 100);
        return;
      }
    }
    const firstNavLink = this.navLinks[0];
    if (firstNavLink) this.setActiveNavLink(firstNavLink);
  }

  initThemeToggle() {
    if (!this.themeToggle) return;
    this.themeToggle.addEventListener("click", this.toggleTheme.bind(this));
    this.themeToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === "dark" ? "light" : "dark");
  }

  setTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "dark";
    this.currentTheme = theme;
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    this.updateThemeIcon(theme);
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (_) {}
    document.body.classList.add("theme-transitioning");
    setTimeout(() => document.body.classList.remove("theme-transitioning"), 300);
  }

  updateThemeIcon(theme) {
    if (!this.themeIcon) return;
    if (theme === "light") {
      this.themeIcon.className = "fas fa-moon";
      this.themeToggle.setAttribute("aria-label", "Switch to dark mode");
    } else {
      this.themeIcon.className = "fas fa-sun";
      this.themeToggle.setAttribute("aria-label", "Switch to light mode");
    }
  }

  loadSavedTheme() {
    try {
      const saved = localStorage.getItem("portfolio-theme");
      if (saved === "light" || saved === "dark") {
        this.setTheme(saved);
        return;
      }
    } catch (_) {}
    this.setTheme("dark");
  }

  initMobileNavigation() {
    let mobileToggle = this.navbar.querySelector(".mobile-toggle");
    if (!mobileToggle) {
      mobileToggle = document.createElement("button");
      mobileToggle.className = "mobile-toggle";
      mobileToggle.setAttribute("aria-label", "Toggle navigation menu");
      mobileToggle.setAttribute("aria-expanded", "false");
      mobileToggle.innerHTML = '<span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span>';
      this.navbar.querySelector(".container").appendChild(mobileToggle);
    }
    mobileToggle.addEventListener("click", this.toggleMobileMenu.bind(this));
    document.addEventListener("click", (e) => {
      if (!this.navbar.contains(e.target)) this.closeMobileMenu();
    });
  }

  toggleMobileMenu() {
    if (this.navMenu.classList.contains("mobile-open")) this.closeMobileMenu();
    else this.openMobileMenu();
  }

  openMobileMenu() {
    this.navMenu.classList.add("mobile-open");
    const t = this.navbar.querySelector(".mobile-toggle");
    if (t) t.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }

  closeMobileMenu() {
    this.navMenu.classList.remove("mobile-open");
    const t = this.navbar.querySelector(".mobile-toggle");
    if (t) t.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  destroy() {
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.navLinks.forEach((link) => link.removeEventListener("click", this.handleNavClick));
    if (this.themeToggle) this.themeToggle.removeEventListener("click", this.toggleTheme);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("keydown", this.handleKeyboardNavigation);
  }
}

function initScrollAnimations() {
  const animated = document.querySelectorAll(".animate");
  if (!animated.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.animateDelay;
        if (delay) el.style.transitionDelay = delay + "ms";
        el.classList.add("visible");
        observer.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 }
  );
  animated.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  window.portfolioNavigation = new PortfolioNavigation();
  initScrollAnimations();
});

if (typeof module !== "undefined" && module.exports) module.exports = PortfolioNavigation;
