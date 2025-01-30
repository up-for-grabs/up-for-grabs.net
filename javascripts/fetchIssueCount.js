// Use ESM instead of AMD for modern JavaScript environments
import 'whatwg-fetch';
import 'promise-polyfill';

/**
 * @typedef {Object} CacheEntry
 * @property {number|string} count - The issue count
 * @property {string} etag - The ETag from GitHub API
 * @property {string} date - ISO string of when the entry was cached
 */

class GitHubIssueCounter {
  static RATE_LIMIT_RESET_KEY = 'github-rate-limit-reset-at';
  static CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  static PER_PAGE = 30;

  /**
   * @private
   * @param {string} key
   * @returns {any | undefined}
   */
  static getFromStorage(key) {
    try {
      const item = localStorage?.getItem(key);
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * @private
   * @param {string} key
   * @param {any} value
   */
  static setInStorage(key, value) {
    try {
      localStorage?.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Only ignore quota errors, throw others
      if (!error.name?.includes('QuotaExceeded')) {
        throw error;
      }
    }
  }

  /**
   * @private
   * @param {string} key
   */
  static clearFromStorage(key) {
    try {
      localStorage?.removeItem(key);
    } catch {
      // Ignore errors when clearing storage
    }
  }

  /**
   * @private
   * @param {Response} response
   * @returns {Error | undefined}
   */
  static checkRateLimit(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetTime = response.headers.get('X-RateLimit-Reset');

    if (remaining === '0' && resetTime) {
      const resetDate = new Date(Number(resetTime) * 1000);
      this.setInStorage(this.RATE_LIMIT_RESET_KEY, resetDate.toISOString());
      return new Error(
        `GitHub rate limit reached. Resets at ${resetDate.toLocaleTimeString()}`
      );
    }
  }

  /**
   * @private
   * @param {Object} json
   * @param {Response} response
   * @returns {Error}
   */
  static createError(json, response) {
    return new Error(
      `GitHub API Error: ${json.message || response.statusText}`
    );
  }

  /**
   * Fetch issue count for a GitHub repository
   * @param {string} ownerAndName - Format: "/owner/repo"
   * @param {string} label - Issue label to filter by
   * @returns {Promise<number|string>}
   */
  static async fetchIssueCount(ownerAndName, label) {
    // Input validation
    if (!ownerAndName?.match(/^\/[\w-]+\/[\w-]+$/)) {
      throw new Error('Invalid repository format. Use "/owner/repo"');
    }

    // Check cache
    const cached = this.getFromStorage(ownerAndName);
    const now = new Date();
    
    if (cached?.date && (new Date(cached.date).getTime() + this.CACHE_DURATION_MS > now.getTime())) {
      return cached.count;
    }

    // Check rate limiting
    const rateLimitReset = this.getFromStorage(this.RATE_LIMIT_RESET_KEY);
    if (rateLimitReset && new Date(rateLimitReset) > now) {
      throw new Error(
        `GitHub rate limit active. Resets at ${new Date(rateLimitReset).toLocaleTimeString()}`
      );
    }
    this.clearFromStorage(this.RATE_LIMIT_RESET_KEY);

    // Prepare request
    const apiUrl = new URL(
      `https://api.github.com/repos${ownerAndName}/issues`
    );
    apiUrl.searchParams.set('labels', label);
    apiUrl.searchParams.set('per_page', String(this.PER_PAGE));

    const headers = {
      'Accept': 'application/json',
      ...(cached?.etag && { 'If-None-Match': cached.etag })
    };

    try {
      const response = await fetch(apiUrl, { headers });

      // Handle Not Modified (304)
      if (response.status === 304 && cached) {
        return cached.count;
      }

      // Handle errors
      if (!response.ok) {
        this.clearFromStorage(ownerAndName);
        
        const rateLimitError = this.checkRateLimit(response);
        if (rateLimitError) throw rateLimitError;

        const json = await response.json();
        throw this.createError(json, response);
      }

      // Process successful response
      const etag = response.headers.get('ETag');
      const linkHeader = response.headers.get('Link');

      // Check for pagination
      const lastPageMatch = linkHeader?.match(/<[^<>]*?page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        const lastPage = Number(lastPageMatch[1]);
        const baseCount = this.PER_PAGE * (lastPage - 1);
        const count = `${baseCount}+`;

        this.setInStorage(ownerAndName, {
          count,
          etag,
          date: now.toISOString()
        });

        return count;
      }

      // Handle single page of results
      const json = await response.json();
      if (Array.isArray(json)) {
        this.setInStorage(ownerAndName, {
          count: json.length,
          etag,
          date: now.toISOString()
        });

        return json.length;
      }

      throw new Error('Unexpected response format from GitHub API');

    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Network error while fetching GitHub issues');
    }
  }
}

export default GitHubIssueCounter.fetchIssueCount;
