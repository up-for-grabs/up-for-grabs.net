import { expect, test, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { VueQueryPlugin } from '@tanstack/vue-query';

import { type WebsiteProject } from '../data/schema';

import SearchResults from './SearchResults.vue';

const projectWithoutStats: WebsiteProject = {
  id: 'abcdef',
  name: 'a title',
  desc: 'a description',
  site: 'https://github.com/some-owner/something',
  tags: [],
  upforgrabs: {
    name: 'good-first-issue',
    link: 'https://github.com/some-owner/something/labels/good-first-issue',
  },
  stats: {},
};

const searchResults: Array<WebsiteProject> = [
  {
    id: 'abcdef',
    name: 'a title',
    desc: 'a description',
    site: 'https://github.com/some-owner/something',
    tags: [],
    upforgrabs: {
      name: 'good-first-issue',
      link: 'https://github.com/some-owner/something/labels/good-first-issue',
    },
    stats: {},
  },
  {
    id: 'ghijkl',
    name: 'another title',
    desc: 'another description',
    site: 'https://github.com/some-owner/another',
    tags: [],
    upforgrabs: {
      name: 'good-first-issue',
      link: 'https://github.com/some-owner/another/labels/good-first-issue',
    },
    stats: {},
  },
];

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());

const restHandlers = [
  http.get('/data.json', () => {
    return HttpResponse.json(searchResults);
  }),
];

const server = setupServer(...restHandlers);

test('SearchResults displays count of initial projects when first rendered', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [projectWithoutStats],
    },
    global: {
      plugins: [VueQueryPlugin],
    },
  });

  await flushPromises();

  const textInput = wrapper.find('#search');
  expect(textInput.text()).toBe('');

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('2 projects found');
});

test('SearchResults fetches and displays initial count of projects', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [],
    },
    global: {
      plugins: [VueQueryPlugin],
    },
  });

  await flushPromises();

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('2 projects found');
});

test('SearchResults updates count when filter returns additional results', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [projectWithoutStats],
    },
    global: {
      plugins: [VueQueryPlugin],
    },
  });

  const textInput = wrapper.find('#search');
  await textInput.setValue('foo');

  await flushPromises();

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('0 projects found');
});
