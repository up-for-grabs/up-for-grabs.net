import { expect, test } from 'vitest';
import SearchResults from './SearchResults.vue';

import { mount, flushPromises } from '@vue/test-utils';
import { WebsiteProject } from '../data/schema';
import { ResponseMessage } from '../data/search';

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

test('SearchResults displays count of initial projects when first rendered', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [projectWithoutStats],
      fetchProjects: (date: Date) => Promise.resolve([]),
      filterProjects: (text: string, date: Date) =>
        Promise.resolve<ResponseMessage>({ type: 'search-results', list: [] }),
    },
  });

  const textInput = wrapper.find('#search');
  expect(textInput.text()).toBe('');

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('1 projects found');
});

const projectWithStats: WebsiteProject = {
  id: 'abcdef',
  name: 'a title',
  desc: 'a description',
  site: 'https://github.com/some-owner/something',
  tags: [],
  upforgrabs: {
    name: 'good-first-issue',
    link: 'https://github.com/some-owner/something/labels/good-first-issue',
  },
  stats: {
    lastUpdated: new Date(),
    issueCount: 1,
    forkCount: 1,
  },
};

test('SearchResults fetches and displays initial count of projects', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [],
      fetchProjects: (date: Date) => Promise.resolve([projectWithStats]),
      filterProjects: (text: string, date: Date) =>
        Promise.resolve<ResponseMessage>({ type: 'search-results', list: [] }),
    },
  });

  await flushPromises(); // wait for fetchProjects promise to resolve

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('1 projects found');
});

test('SearchResults updates UI when filter does not return results', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [projectWithoutStats],
      fetchProjects: (date: Date) => Promise.resolve([]),
      filterProjects: (text: string, date: Date) =>
        Promise.resolve<ResponseMessage>({ type: 'search-results', list: [] }),
    },
  });

  const textInput = wrapper.find('#search');
  await textInput.setValue('foo');

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('0 projects found');
});

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

test('SearchResults updates count when filter returns additional results', async () => {
  const wrapper = mount(SearchResults, {
    props: {
      initialProjects: [projectWithoutStats],
      fetchProjects: (date: Date) => Promise.resolve([]),
      filterProjects: (text: string, date: Date) => {
        // assert the client send the text through
        expect(text).toBe('foo');

        // return more results than expected
        return Promise.resolve<ResponseMessage>({
          type: 'search-results',
          list: searchResults,
        });
      },
    },
  });

  const textInput = wrapper.find('#search');
  await textInput.setValue('foo');

  const resultsCount = wrapper.find('.results-count');
  expect(resultsCount.text()).toBe('2 projects found');
});
