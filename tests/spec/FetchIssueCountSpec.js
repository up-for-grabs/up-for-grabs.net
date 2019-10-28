const fetchIssueCount = require('../../javascripts/fetchIssueCount');

const defaultEtag = 'a00049ba79152d03380c34652f2cb612';

function stubRateLimitError(timeInSeconds) {
  fetch.mockResponseOnce(JSON.stringify([{ something: 'yes' }]), {
    status: 403,
    headers: [
      ['Content-Type', 'application/json'],
      ['X-RateLimit-Remaining', '0'],
      ['X-RateLimit-Reset', timeInSeconds.toString()],
    ],
  });
}

function stubFetchResult(items, etag) {
  fetch.mockResponseOnce(JSON.stringify(items), {
    status: 200,
    headers: [
      ['Content-Type', 'application/json'],
      ['ETag', etag || defaultEtag],
    ],
  });
}

describe('fetchIssueCount', () => {
  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
  });

  it('fetches the issue label URL of a GitHub project', async () => {
    const oneItem = [{}];
    stubFetchResult(oneItem);
    await expect(fetchIssueCount('owner/repo', 'label')).resolves.toEqual(1);
  });

  it('uses the last Link header value and infers the issue count', async () => {
    const oneItem = [{}];
    fetch.mockResponseOnce(JSON.stringify(oneItem), {
      status: 200,
      headers: [
        ['Content-Type', 'application/json'],
        ['ETag', 'a00049ba79152d03380c34652f2cb612'],
        [
          'Link',
          '<https://api.github.com/repositories/9891249/issues?label=help+wanted&page=2>; rel="next", <https://api.github.com/repositories/9891249/issues?label=help+wanted&page=7>; rel="last"',
        ],
      ],
    });

    // given a page of API results = N (30 by default)
    // the count of results = 6 * N < 7 pages <= 7 * N
    // this should be represented as an upper bound of the results
    await expect(
      fetchIssueCount('xunit/xunit', 'help%20wanted')
    ).resolves.toEqual('180+');
  });

  describe('local storage', () => {
    it('can retrieve issue count from local storage for the project', async () => {
      const project = 'owner/project';

      const fourItems = [{}, {}, {}, {}];
      stubFetchResult(fourItems);

      const promise = fetchIssueCount(project, 'label');

      const cachedCount = promise.then(() => {
        const cached = localStorage.getItem(project);
        const obj = JSON.parse(cached);
        return obj.count;
      });

      await expect(cachedCount).resolves.toEqual(4);
    });

    it('can retrieve ETag from local storage for the project', async () => {
      const expectedEtag = 'bcd049ba79152d03380c34652f2cb612';
      stubFetchResult([], expectedEtag);

      const project = 'owner/project';

      const promise = fetchIssueCount(project, 'label');

      const cachedEtag = promise.then(() => {
        const cached = localStorage.getItem(project);
        const obj = JSON.parse(cached);
        return obj.etag;
      });

      await expect(cachedEtag).resolves.toEqual(expectedEtag);
    });

    it('can read a timestamp from local storage for the project', async () => {
      stubFetchResult([]);
      const project = 'owner/project';

      const promise = fetchIssueCount(project, 'label');

      const cachedDate = promise.then(() => {
        const cached = localStorage.getItem(project);
        const obj = JSON.parse(cached);
        return obj.date;
      });

      await expect(cachedDate).resolves.toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z/
      );
    });
  });

  describe('caching', () => {
    it('does not make API call if cache is valid', async () => {
      const project = 'owner/project';

      const sixHoursAgo = new Date() - 1000 * 60 * 60 * 6;

      localStorage.setItem(
        project,
        JSON.stringify({
          count: 6,
          date: sixHoursAgo,
        })
      );

      const promise = fetchIssueCount(project, 'label');

      await expect(promise).resolves.toBe(6);
      expect(fetch.mock.calls).toHaveLength(0);
    });

    it('makes API call with etag if cache is considered expired', async () => {
      const project = 'owner/project';
      const expectedEtag = 'def049ba79152d03380c34652f2cb612';

      const threeDaysAgo = new Date() - 1000 * 60 * 60 * 72;

      localStorage.setItem(
        project,
        JSON.stringify({
          count: 6,
          etag: expectedEtag,
          date: threeDaysAgo,
        })
      );

      const fourItems = [{}, {}, {}, {}];
      stubFetchResult(fourItems);

      const promise = fetchIssueCount(project, 'label');

      await expect(promise).resolves.toBe(4);

      expect(fetch.mock.calls).toHaveLength(1);
      expect(fetch.mock.calls[0][1].headers['If-None-Match']).toBe(
        expectedEtag
      );
    });

    it('handles 304 Not Modified and returns cached value', async () => {
      const project = 'owner/project';
      const expectedEtag = 'b00049ba79152d03380c34652f2cb612';

      const twoDaysAgo = new Date() - 1000 * 60 * 60 * 48;

      localStorage.setItem(
        project,
        JSON.stringify({
          count: 3,
          etag: expectedEtag,
          date: twoDaysAgo,
        })
      );

      // ignore the JSON in the API response if a 304 is found
      fetch.mockResponseOnce(JSON.stringify({}), {
        status: 304,
        headers: [
          ['Content-Type', 'application/octet-stream'],
          ['ETag', expectedEtag],
        ],
      });

      const promise = fetchIssueCount(project, 'label');

      await expect(promise).resolves.toBe(3);
    });

    it('if 304 Not Modified is returned but nothing cached, returns zero', async () => {
      const project = 'owner/project';

      // ignore the JSON in the API response if a 304 is found
      fetch.mockResponseOnce(JSON.stringify({}), {
        status: 304,
        headers: [
          ['Content-Type', 'application/octet-stream'],
          ['ETag', 'a00049ba79152d03380c34652f2cb612'],
        ],
      });

      const promise = fetchIssueCount(project, 'label');

      await expect(promise).resolves.toBe(0);
    });

    it('updates cache if a 200 is received', async () => {
      const project = 'owner/project';
      const twoDaysAgo = new Date() - 2 * (1000 * 60 * 60 * 24);

      localStorage.setItem(
        project,
        JSON.stringify({
          count: 3,
          date: twoDaysAgo,
        })
      );

      const fourItems = [{}, {}, {}, {}];
      stubFetchResult(fourItems, 'some-updated-value');

      const promise = fetchIssueCount(project, 'label');

      const cachedEtag = promise.then(() => {
        const cached = localStorage.getItem(project);
        const obj = JSON.parse(cached);
        return obj.etag;
      });

      await expect(promise).resolves.toBe(4);
      await expect(cachedEtag).resolves.toBe('some-updated-value');
    });
  });

  describe('error handling', () => {
    it('handles rate-limiting response and returns an error', async () => {
      const lastSundayInSeconds = 1561912503;
      const lastSunday = new Date(1000 * lastSundayInSeconds);

      stubRateLimitError(lastSundayInSeconds);

      const expectedError = new Error(
        `GitHub rate limit met. Reset at ${lastSunday.toLocaleTimeString()}`
      );

      await expect(fetchIssueCount('owner/repo', 'label')).rejects.toEqual(
        expectedError
      );
    });

    it('no further API calls made after rate-limiting', () => {
      const anHourFromNowInTicks = Date.now() + 1000 * 60 * 60;
      const anHourFromNow = new Date(anHourFromNowInTicks);
      const anHourFromNowInSeconds = Math.floor(anHourFromNow.getTime() / 1000);

      stubRateLimitError(anHourFromNowInSeconds);

      return new Promise(done => {
        const makeRequestAndIgnoreError = function() {
          return fetchIssueCount('owner/repo', 'label').then(
            () => {},
            () => {}
          );
        };

        makeRequestAndIgnoreError()
          .then(() => makeRequestAndIgnoreError())
          .then(() => {
            try {
              expect(fetch.mock.calls).toHaveLength(1);
              done();
            } catch (e) {
              done(e);
            }
          });
      });
    });

    it('rate-limit reset time is cleared eventually', () => {
      const RateLimitResetAtKey = 'Rate-Limit-Reset-At';

      const twoHoursAgoInTicks = Date.now() - 2 * 1000 * 60 * 60;
      const twoHoursAgo = new Date(twoHoursAgoInTicks);
      const twoHoursAgoInSeconds = Math.floor(twoHoursAgo.getTime() / 1000);

      stubRateLimitError(twoHoursAgoInSeconds);

      return new Promise(done => {
        const makeRequestAndIgnoreError = function() {
          return fetchIssueCount('owner/repo', 'label').then(
            () => {},
            () => {}
          );
        };

        makeRequestAndIgnoreError()
          .then(() => {
            expect(localStorage.getItem(RateLimitResetAtKey)).not.toBeNull();
          })
          .then(() => {
            const fourItems = [{}, {}, {}, {}];
            stubFetchResult(fourItems, 'some-updated-value');

            return fetchIssueCount('owner/repo', 'label');
          })
          .then(() => {
            expect(localStorage.getItem(RateLimitResetAtKey)).toBeNull();
            done();
          });
      });
    });

    it('handles API error', async () => {
      const message = 'The repository could not be found on the server';

      fetch.mockResponseOnce(
        JSON.stringify({
          message,
          documentation_url: 'https://developer.github.com/v3/#rate-limiting',
        }),
        {
          status: 404,
          headers: [['Content-Type', 'application/json']],
        }
      );

      const expectedError = new Error(
        `Could not get issue count from GitHub: ${message}`
      );

      await expect(fetchIssueCount('owner/repo', 'label')).rejects.toEqual(
        expectedError
      );
    });

    it('handles generic error', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), {
        status: 404,
        headers: [['Content-Type', 'application/json']],
      });

      const expectedError = new Error(
        'Could not get issue count from GitHub: Not Found'
      );

      await expect(fetchIssueCount('owner/repo', 'label')).rejects.toEqual(
        expectedError
      );
    });
  });
});
