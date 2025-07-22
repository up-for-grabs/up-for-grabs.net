/* eslint global-require: "off" */
/* eslint block-scoped-var: "off" */

/* eslint function-paren-newline: [ "off" ] */
/* eslint implicit-arrow-linebreak: [ "off" ] */

// @ts-nocheck

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['whatwg-fetch', 'promise-polyfill'], () => {
  const { localStorage, fetch } = window;

  const RateLimitResetAtKey = 'Rate-Limit-Reset-At';

  /**
   * Read and deserialize a value from local storage.
   *
   * @param {string} key
   *
   * @returns {any | undefined}
   */
  function getValue(key) {
    if (typeof localStorage !== 'undefined') {
      const result = localStorage.getItem(key);
      if (result !== null) {
        return JSON.parse(result);
      }
    }
    return undefined;
  }

  /**
   * Clear a value from local storage.
   *
   * @param {string} key
   */
  function clearValue(key) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  /**
   * Update a key in local storage to a new value.
   *
   * @param {string} key
   * @param {any} value
   */
  function setValue(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (exception) {
      if (
        exception != QUOTA_EXCEEDED_ERR &&
        exception != NS_ERROR_DOM_QUOTA_REACHED
      ) {
        throw exception;
      }
    }
  }

  /**
   * Inspect the response from the GitHub API to see if was related to being
   * rate-limited by the server.
   *
   * @param {Response} response
   *
   * @returns {Error | undefined}
   */
  function inspectRateLimitError(response) {
    const rateLimited = response.headers.get('X-RateLimit-Remaining') === '0';
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (rateLimited && rateLimitReset) {
      const rateLimitResetAt = new Date(1000 * rateLimitReset);
      setValue(RateLimitResetAtKey, rateLimitResetAt);
      return new Error(
        `GitHub rate limit met. Reset at ${rateLimitResetAt.toLocaleTimeString()}`
      );
    }

    return undefined;
  }

  /**
   * Inspect the response from the GitHub API to return a helpful error message.
   *
   * @param {any} json
   * @param {Response} response
   *
   * @returns {Error}
   */
  function inspectGenericError(json, response) {
    const { message } = json;
    const errorMessage = message || response.statusText;
    return new Error(`Could not get issue count from GitHub: ${errorMessage}`);
  }

  /**
   * Fetch and cache the issue count for the requested repository using the
   * GitHub API.
   *
   * This covers a whole bunch of scenarios:
   *
   *  - cached values are used if re-requested within the next 24 hours
   *  - ETags are included on the request, if found in the cache
   *  - Rate-limiting will report an error, and no further requests will be
   *    made until that has period has elapsed.
   *
   * @param {string} ownerAndName
   * @param {string} label
   *
   * @returns {number|string|null}
   */
  function fetchIssueCount(ownerAndName, label) {
    const cached = getValue(ownerAndName);
    const now = new Date();

    const yesterday = now - 1000 * 60 * 60 * 24;

    if (cached && cached.date && new Date(cached.date) >= yesterday) {
      return Promise.resolve(cached.count);
    }

    const rateLimitResetAt = getValue(RateLimitResetAtKey);

    if (rateLimitResetAt) {
      const d = new Date(rateLimitResetAt);

      if (d > now) {
        return Promise.reject(
          new Error(`GitHub rate limit met. Reset at ${d.toLocaleTimeString()}`)
        );
      }

      clearValue(RateLimitResetAtKey);
    }

    const perPage = 30;

    // TODO: we're not extracting the leading or trailing slash in
    //       `ownerAndName` when the previous regex is passed in here. This
    //       would be great to cleanup at some stage
    const apiURL = `https://api.github.com/repos${ownerAndName}issues?labels=${label}&per_page=${perPage}`;

    const settings = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    if (cached && cached.etag) {
      settings.headers = {
        ...settings,
        'If-None-Match': cached.etag,
      };
    }

    return new Promise((resolve, reject) => {
      fetch(apiURL, settings).then(
        (response) => {
          if (!response.ok) {
            if (response.status === 304) {
              // no content is returned in the 304 Not Modified response body
              const count = cached ? cached.count : 0;
              resolve(count);
              return;
            }

            clearValue(ownerAndName);

            const rateLimitError = inspectRateLimitError(response);
            if (rateLimitError) {
              reject(rateLimitError);
              return;
            }

            response.json().then(
              (json) => {
                reject(inspectGenericError(json, response));
              },
              (error) => {
                reject(error);
              }
            );

            return;
          }

          const etag = response.headers.get('ETag');
          const linkHeader = response.headers.get('Link');

          if (linkHeader) {
            const lastPageMatch = /<([^<>]*?page=(\d*))>; rel="last"/g.exec(
              linkHeader
            );
            if (lastPageMatch && lastPageMatch.length === 3) {
              const lastPageCount = Number(lastPageMatch[2]);
              const baseCount = perPage * (lastPageCount - 1);
              const count = `${baseCount}+`;

              setValue(ownerAndName, {
                count,
                etag,
                date: new Date(),
              });

              resolve(count);
              return;
            }
          }

          response.json().then(
            (json) => {
              if (json && typeof json.length === 'number') {
                const count = json.length;
                setValue(ownerAndName, {
                  count,
                  etag,
                  date: new Date(),
                });

                resolve(count);
              }
            },
            (error) => {
              reject(error);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  return fetchIssueCount;
});
