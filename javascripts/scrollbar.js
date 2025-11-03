/**
 * Scrollbar Navigation Functionality
 * Handles scrollbar progress tracking, section navigation, and visual feedback
 * @fileoverview Scrollbar navigation with progress indicator and section markers
 */

(function() {
    'use strict';
  
    // Configuration
    const SCROLLBAR_UPDATE_THROTTLE = 50; // Throttle scroll updates (ms)
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
      /** @type {number} */
      let lastExec = 0;
      /**
       * Throttled function
       * @param {...*} args - Arguments to pass to the function
       * @returns {void}
       */
      return function executedFunction(...args) {
        const now = Date.now();
        const later = function() {
          lastExec = now;
          func.apply(null, args);
        };
        if (now - lastExec > wait) {
          later();
        } else {
          clearTimeout(timeout);
          timeout = setTimeout(later, wait - (now - lastExec));
        }
      };
    }
  
    /**
     * Get scrollbar element
     * @returns {HTMLElement|null} Scrollbar navigation element
     */
    function getScrollbar() {
      return document.getElementById('scrollbar-nav');
    }
  
    /**
     * Get scrollbar progress element
     * @returns {HTMLElement|null} Progress bar element
     */
    function getScrollbarProgress() {
      return document.getElementById('scrollbar-progress');
    }
  
    /**
     * Get all scrollbar markers
     * @returns {NodeListOf<HTMLElement>} List of scrollbar markers
     */
    function getScrollbarMarkers() {
      return document.querySelectorAll('.scrollbar-marker');
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
     * Calculate scroll progress percentage
     * @returns {number} Scroll progress (0-100)
     */
    function calculateScrollProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      
      if (scrollableHeight <= 0) return 0;
      return (scrollTop / scrollableHeight) * 100;
    }
  
    /**
     * Update scrollbar progress indicator
     * @returns {void}
     */
    function updateScrollbarProgress() {
      const progress = getScrollbarProgress();
      if (!progress) return;
      
      const scrollPercent = calculateScrollProgress();
      progress.style.height = scrollPercent + '%';
    }
  
    /**
     * Get current active section based on scroll position
     * @returns {string} Active section ID
     */
    function getActiveSection() {
      const scrollPosition = window.pageYOffset + window.innerHeight / 2;
      const sections = Object.values(SECTIONS);
      
      // Check each section to see if we're in its range
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const section = getSectionElement(sectionId);
        
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + window.pageYOffset;
          const sectionBottom = sectionTop + rect.height;
          
          if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            return sectionId;
          }
        }
      }
      
      // Default to first section
      return sections[0];
    }
  
    /**
     * Update active state of scrollbar markers
     * @returns {void}
     */
    function updateActiveMarker() {
      const activeSection = getActiveSection();
      const markers = getScrollbarMarkers();
      
      markers.forEach(function(marker) {
        const sectionId = marker.getAttribute('data-section');
        if (sectionId === activeSection) {
          marker.classList.add('active');
        } else {
          marker.classList.remove('active');
        }
      });
    }
  
    /**
     * Position markers based on section locations
     * @returns {void}
     */
    function positionMarkers() {
      const scrollbarTrack = document.querySelector('.scrollbar-track');
      if (!scrollbarTrack) return;
      
      const markers = getScrollbarMarkers();
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;
      const trackElement = /** @type {HTMLElement} */ (scrollbarTrack);
      const trackHeight = trackElement.offsetHeight - 40; // Account for padding
      const trackTop = trackElement.offsetTop;
      
      if (scrollableHeight <= 0) return;
      
      markers.forEach(function(marker) {
        const sectionId = marker.getAttribute('data-section');
        if (!sectionId) return;
        
        const section = getSectionElement(sectionId);
        
        if (section) {
          const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
          const sectionPercent = (sectionTop / scrollableHeight) * 100;
          
          // Clamp between 0 and 100
          const clampedPercent = Math.max(0, Math.min(100, sectionPercent));
          
          // Position marker relative to track
          const markerPosition = (clampedPercent / 100) * trackHeight;
          marker.style.position = 'absolute';
          marker.style.top = (markerPosition + 20) + 'px'; // 20px padding
          marker.style.left = '50%';
          marker.style.transform = 'translateX(-50%)';
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
      
      const navbar = document.getElementById('main-navbar');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const scrollbar = getScrollbar();
      const scrollbarOffset = scrollbar ? scrollbar.offsetHeight / 2 : 0;
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.pageYOffset;
      const targetPosition = sectionTop - headerHeight - navbarHeight - 30; // 30px padding
      
      // Smooth scroll
      window.scrollTo({
        top: Math.max(0, targetPosition),
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
      
      // Update active marker after a short delay
      setTimeout(function() {
        updateActiveMarker();
        updateScrollbarProgress();
      }, 500);
    }
  
    /**
     * Handle scrollbar marker clicks
     * @param {Event} event - Click event
     * @returns {void}
     */
    function handleMarkerClick(event) {
      const marker = /** @type {HTMLElement} */ (event.currentTarget);
      const sectionId = marker.getAttribute('data-section');
      
      if (sectionId && sectionId in SECTIONS) {
        scrollToSection(sectionId, event);
      }
    }
  
    /**
     * Handle scroll events
     * @returns {void}
     */
    function handleScroll() {
      updateScrollbarProgress();
      updateActiveMarker();
    }
  
    /**
     * Handle window resize
     * @returns {void}
     */
    function handleResize() {
      positionMarkers();
      updateScrollbarProgress();
      updateActiveMarker();
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
        updateActiveMarker();
      }
    }
  
    /**
     * Initialize scrollbar functionality
     * @returns {void}
     */
    function initScrollbar() {
      const scrollbar = getScrollbar();
      if (!scrollbar) {
        console.warn('Scrollbar element not found');
        return;
      }
  
      // Position markers initially
      setTimeout(function() {
        positionMarkers();
        updateScrollbarProgress();
        updateActiveMarker();
      }, 100);
  
      // Re-position markers on resize
      window.addEventListener('resize', function() {
        setTimeout(handleResize, 100);
      });
  
      // Attach click handlers to all scrollbar markers
      const markers = getScrollbarMarkers();
      markers.forEach(function(marker) {
        marker.addEventListener('click', handleMarkerClick);
        
        // Add keyboard support
        marker.addEventListener('keydown', function(event) {
          const keyEvent = /** @type {KeyboardEvent} */ (event);
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            keyEvent.preventDefault();
            handleMarkerClick(keyEvent);
          }
        });
      });
  
      // Handle scroll events with throttling
      const throttledScroll = throttle(handleScroll, SCROLLBAR_UPDATE_THROTTLE);
      window.addEventListener('scroll', /** @type {EventListener} */ (throttledScroll), { passive: true });
  
      // Handle hash changes
      window.addEventListener('hashchange', handleHashChange);
      
      // Handle initial hash if present
      handleHashChange();
  
      // Update active marker on initial load
      setTimeout(function() {
        updateActiveMarker();
        updateScrollbarProgress();
      }, 500);
  
      // Handle browser back/forward buttons
      window.addEventListener('popstate', function() {
        handleHashChange();
      });
  
      // Intersection Observer for better scroll detection
      if ('IntersectionObserver' in window) {
        /**
         * Observer callback for intersection changes
         * @param {IntersectionObserverEntry[]} entries - Intersection entries
         * @returns {void}
         */
        const observerCallback = function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              const sectionId = entry.target.id;
              if (sectionId in SECTIONS) {
                const markers = getScrollbarMarkers();
                markers.forEach(function(marker) {
                  const markerSection = marker.getAttribute('data-section');
                  if (markerSection === sectionId) {
                    marker.classList.add('active');
                  } else {
                    marker.classList.remove('active');
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
  
        const observerOptions = {
          root: null,
          rootMargin: '-20% 0px -50% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1]
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
  
      console.log('Scrollbar navigation initialized successfully');
    }
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollbar);
    } else {
      initScrollbar();
    }
  
    // Re-initialize if content is dynamically loaded (for RequireJS apps)
    if (typeof window.require !== 'undefined' && typeof window.require === 'function') {
      try {
        // @ts-ignore - RequireJS is loaded dynamically
        window.require(['app'], function() {
          setTimeout(initScrollbar, 1000);
        });
      } catch (e) {
        // RequireJS not available or error loading
        console.log('RequireJS not available, skipping scrollbar re-initialization');
      }
    }
  
  })();
  
  