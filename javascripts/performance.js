// Performance improvements for Up For Grabs
// Provides pagination, lazy loading, and caching to improve site speed

define(['jquery'], function($) {

  // Configuration
  const CONFIG = {
    CACHE_KEY: 'up-for-grabs-projects-cache',
    CACHE_EXPIRY: 3600000, // 1 hour in milliseconds
    PROJECTS_PER_PAGE: 30
  };

  // Store a page of projects in cache
  function storeInCache(projects) {
    try {
      if (!window.localStorage) return;
      
      const cacheData = {
        timestamp: Date.now(),
        projects: projects
      };
      
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cacheData));
      console.log('Cached projects in localStorage');
    } catch (e) {
      console.warn('Could not cache projects', e);
    }
  }

  // Get projects from cache
  function getFromCache() {
    try {
      if (!window.localStorage) return null;
      
      const cache = localStorage.getItem(CONFIG.CACHE_KEY);
      if (!cache) return null;
      
      const cacheData = JSON.parse(cache);
      if (!cacheData || !cacheData.timestamp) return null;
      
      // Check if cache is expired
      if (Date.now() - cacheData.timestamp > CONFIG.CACHE_EXPIRY) {
        localStorage.removeItem(CONFIG.CACHE_KEY);
        return null;
      }
      
      return cacheData.projects;
    } catch (e) {
      console.warn('Error retrieving cached projects', e);
      return null;
    }
  }

  // Split projects into pages
  function paginateProjects(projects, currentPage) {
    const page = currentPage || 1;
    const start = (page - 1) * CONFIG.PROJECTS_PER_PAGE;
    return projects.slice(start, start + CONFIG.PROJECTS_PER_PAGE);
  }

  // Get total number of pages needed
  function getTotalPages(projects) {
    return Math.ceil(projects.length / CONFIG.PROJECTS_PER_PAGE);
  }

  // Create pagination controls (returns jQuery object)
  function createPagination(currentPage, totalPages, onPageChange) {
    const $pagination = $('<div class="pagination"></div>');
    
    // Add previous button
    if (currentPage > 1) {
      const $prev = $('<button class="pagination-prev">«</button>');
      $prev.on('click', function() {
        onPageChange(currentPage - 1);
      });
      $pagination.append($prev);
    } else {
      $pagination.append('<button class="pagination-prev" disabled>«</button>');
    }
    
    // Page buttons
    const $pages = $('<div class="pagination-pages"></div>');
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (startPage > 1) {
      // First page button
      const $first = $('<button class="pagination-page">1</button>');
      $first.on('click', function() {
        onPageChange(1);
      });
      $pages.append($first);
      
      // Ellipsis if needed
      if (startPage > 2) {
        $pages.append('<span class="pagination-ellipsis">...</span>');
      }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      if (i === currentPage) {
        $pages.append('<button class="pagination-page current">' + i + '</button>');
      } else {
        const $page = $('<button class="pagination-page">' + i + '</button>');
        $page.on('click', function() {
          onPageChange(i);
        });
        $pages.append($page);
      }
    }
    
    // Last page button if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        $pages.append('<span class="pagination-ellipsis">...</span>');
      }
      
      const $last = $('<button class="pagination-page">' + totalPages + '</button>');
      $last.on('click', function() {
        onPageChange(totalPages);
      });
      $pages.append($last);
    }
    
    $pagination.append($pages);
    
    // Next button
    if (currentPage < totalPages) {
      const $next = $('<button class="pagination-next">»</button>');
      $next.on('click', function() {
        onPageChange(currentPage + 1);
      });
      $pagination.append($next);
    } else {
      $pagination.append('<button class="pagination-next" disabled>»</button>');
    }
    
    return $pagination;
  }
  
  // Lazy load images and content
  function setupLazyLoading() {
    // Only run if IntersectionObserver is available
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const card = entry.target;
          
          // Load GitHub stats if needed
          $(card).find('.js-lazy-stats').each(function() {
            const $this = $(this);
            const url = $this.data('stats-url');
            
            if (url) {
              $.getJSON(url)
                .done(function(data) {
                  $this.html(data.count || 0);
                })
                .fail(function() {
                  $this.html('?');
                })
                .always(function() {
                  $this.removeClass('js-lazy-stats');
                });
            }
          });
          
          // Remove from observation once loaded
          observer.unobserve(card);
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });
    
    // Observe all project cards
    $('.data-box').each(function() {
      observer.observe(this);
    });
  }
  
  // Simple debounce function
  function debounce(func, wait) {
    let timeout = null;
    
    return function() {
      const context = this;
      const args = arguments;
      
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
  
  return {
    storeInCache: storeInCache,
    getFromCache: getFromCache,
    paginateProjects: paginateProjects,
    getTotalPages: getTotalPages,
    createPagination: createPagination,
    setupLazyLoading: setupLazyLoading,
    debounce: debounce
  };
});
