/**
 * Navigation Bar Functionality
 * Handles smooth scrolling, active state management, and section highlighting
 * @fileoverview Navigation bar with smooth scrolling and active state management
 */

(function() {
    'use strict';
  
    // Configuration
    const NAVBAR_OFFSET = 80; // Offset for scroll position to account for navbar height
    const SCROLL_THROTTLE = 100; // Throttle scroll events (ms)
    /** @type {Object<string, string>} */
    const SECTIONS = {
      'i-want-to-get-involved': 'i-want-to-get-involved',
      'projects': 'projects',
      'i-maintain-a-project': 'i-maintain-a-project'
    };
  
    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Throttled function
     */
    function throttle(func, wait) {
      /** @type {ReturnType<typeof setTimeout>|undefined} */
      let timeout;
      /**
       * Throttled function
       * @param {...*} args - Arguments to pass to the function
       * @returns {void}
       */
      return function executedFunction(...args) {
        const later = function() {
          clearTimeout(timeout);
          func.apply(null, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  
    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
      /** @type {ReturnType<typeof setTimeout>|undefined} */
      let timeout;
      /**
       * Debounced function
       * @param {...*} args - Arguments to pass to the function
       * @returns {void}
       */
      return function executedFunction(...args) {
        const later = function() {
          clearTimeout(timeout);
          func.apply(null, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  
    /**
     * Get section element by ID
     * @param {string} sectionId - Section ID
     * @returns {HTMLElement|null} Section element or null
     */
    function getSectionElement(sectionId) {
      return document.getElementById(sectionId);
    }
  
    /**
     * Get all navbar links
     * @returns {NodeListOf<HTMLElement>} List of navbar links
     */
    function getNavbarLinks() {
      return document.querySelectorAll('.navbar-link');
    }
  
    /**
     * Get navbar element
     * @returns {HTMLElement|null} Navbar element or null
     */
    function getNavbar() {
      return document.getElementById('main-navbar');
    }
  
    /**
     * Calculate element's position relative to viewport
     * @param {HTMLElement|null} element - Element to calculate position for
     * @returns {{top: number, bottom: number, height: number}} Position object
     */
    function getElementPosition(element) {
      if (!element) return { top: 0, bottom: 0, height: 0 };
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        bottom: rect.bottom + window.pageYOffset,
        height: rect.height
      };
    }
  
    /**
     * Get current active section based on scroll position
     * @returns {string} Active section ID
     */
    function getActiveSection() {
      const scrollPosition = window.pageYOffset + NAVBAR_OFFSET;
      const sections = Object.values(SECTIONS);
      
      // Check each section to see if we're in its range
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const section = getSectionElement(sectionId);
        
        if (section) {
          const pos = getElementPosition(section);
          if (scrollPosition >= pos.top - NAVBAR_OFFSET) {
            return sectionId;
          }
        }
      }
      
      // Default to first section
      return sections[0];
    }
  
    /**
     * Update active state of navbar links
     * @returns {void}
     */
    function updateActiveLink() {
      const activeSection = getActiveSection();
      const links = getNavbarLinks();
      
      links.forEach(function(link) {
        const sectionId = link.getAttribute('data-section');
        if (sectionId === activeSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  
    /**
     * Smooth scroll to section
     * @param {string} sectionId - Section ID to scroll to
     * @param {Event|null} [event] - Optional event to prevent default
     * @returns {void}
     */
    function scrollToSection(sectionId, event) {
      if (event) {
        event.preventDefault();
      }
      
      const section = getSectionElement(sectionId);
      if (!section) return;
      
      const navbar = getNavbar();
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const sectionPosition = getElementPosition(section);
      const targetPosition = sectionPosition.top - navbarHeight - 20; // 20px padding
      
      // Smooth scroll
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Update URL hash without triggering scroll
      if (history.pushState) {
        try {
          history.pushState(null, '', '#' + sectionId);
        } catch (e) {
          // Fallback for browsers that don't support pushState
          window.location.hash = sectionId;
        }
      }
      
      // Update active link after a short delay
      setTimeout(updateActiveLink, 500);
    }
  
    /**
     * Handle navbar link clicks
     * @param {Event} event - Click event
     * @returns {void}
     */
    function handleNavbarClick(event) {
      const link = /** @type {HTMLElement} */ (event.currentTarget);
      const sectionId = link.getAttribute('data-section');
      
      if (sectionId && sectionId in SECTIONS) {
        scrollToSection(sectionId, event);
      }
    }
  
    /**
     * Handle hash changes in URL
     * @returns {void}
     */
    function handleHashChange() {
      const hash = window.location.hash.slice(1); // Remove '#'
      if (hash && hash in SECTIONS) {
        // Small delay to ensure DOM is ready
        setTimeout(function() {
          scrollToSection(hash);
        }, 100);
      } else {
        updateActiveLink();
      }
    }
  
    /**
     * Add scroll effect to navbar
     * @returns {void}
     */
    function handleScroll() {
      const navbar = getNavbar();
      if (!navbar) return;
      
      const scrolled = window.pageYOffset > 50;
      if (scrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      updateActiveLink();
    }
  
    /**
     * Initialize navbar functionality
     * @returns {void}
     */
    function initNavbar() {
      const navbar = getNavbar();
      if (!navbar) {
        console.warn('Navbar element not found');
        return;
      }
  
      // Attach click handlers to all navbar links
      const links = getNavbarLinks();
      links.forEach(function(link) {
        link.addEventListener('click', handleNavbarClick);
        
        // Add keyboard support
        link.addEventListener('keydown', function(event) {
          const keyEvent = /** @type {KeyboardEvent} */ (event);
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            keyEvent.preventDefault();
            handleNavbarClick(keyEvent);
          }
        });
      });
  
      // Handle scroll events with throttling
      const throttledScroll = throttle(handleScroll, SCROLL_THROTTLE);
      window.addEventListener('scroll', /** @type {EventListener} */ (throttledScroll), { passive: true });
  
      // Handle hash changes
      window.addEventListener('hashchange', handleHashChange);
      
      // Handle initial hash if present
      handleHashChange();
  
      // Update active link on initial load
      setTimeout(function() {
        updateActiveLink();
      }, 500);
  
      // Handle browser back/forward buttons
      window.addEventListener('popstate', function() {
        handleHashChange();
      });
  
      // Intersection Observer for better scroll detection
      if ('IntersectionObserver' in window) {
        const observerOptions = {
          root: null,
          rootMargin: '-' + NAVBAR_OFFSET + 'px 0px -50% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1]
        };
  
        /**
         * Observer callback for intersection changes
         * @param {IntersectionObserverEntry[]} entries - Intersection entries
         * @returns {void}
         */
        const observerCallback = function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
              const sectionId = entry.target.id;
              if (sectionId in SECTIONS) {
                const links = getNavbarLinks();
                links.forEach(function(link) {
                  const linkSection = link.getAttribute('data-section');
                  if (linkSection === sectionId) {
                    link.classList.add('active');
                  } else {
                    link.classList.remove('active');
                  }
                });
                
                // Update URL hash
                if (history.replaceState) {
                  try {
                    history.replaceState(null, '', '#' + sectionId);
                  } catch (e) {
                    // Fallback for browsers that don't support replaceState
                    window.location.hash = sectionId;
                  }
                }
              }
            }
          });
        };
  
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observe all sections
        Object.values(SECTIONS).forEach(function(sectionId) {
          const section = getSectionElement(sectionId);
          if (section) {
            observer.observe(section);
          }
        });
      }
  
      console.log('Navbar initialized successfully');
    }
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
      initNavbar();
    }
  
    // Re-initialize if content is dynamically loaded (for RequireJS apps)
    if (typeof window.require !== 'undefined' && typeof window.require === 'function') {
      try {
        // @ts-ignore - RequireJS is loaded dynamically
        window.require(['app'], function() {
          setTimeout(initNavbar, 1000);
        });
      } catch (e) {
        // RequireJS not available or error loading
        console.log('RequireJS not available, skipping re-initialization');
      }
    }
  
  })();
  