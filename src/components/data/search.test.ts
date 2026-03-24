import { expect, test } from 'vitest';
import { filterProject } from './search';
import type { WebsiteProject } from './schema';

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

test('filterProject does match when search text is empty string and no stats', () => {
  expect(filterProject(projectWithoutStats, '', new Date())).toBeTruthy();
});

test('filterProject does match when search text is in name', () => {
  expect(filterProject(projectWithoutStats, 'title', new Date())).toBeTruthy();
  expect(filterProject(projectWithoutStats, 'TITLE', new Date())).toBeTruthy();
  expect(filterProject(projectWithoutStats, 'TiTLe', new Date())).toBeTruthy();
});

test('filterProject does match when search text is in description', () => {
  expect(filterProject(projectWithoutStats, 'desc', new Date())).toBeTruthy();
  expect(filterProject(projectWithoutStats, 'DESC', new Date())).toBeTruthy();
  expect(
    filterProject(projectWithoutStats, 'description', new Date())
  ).toBeTruthy();
  expect(
    filterProject(projectWithoutStats, 'DESCRIPTION', new Date())
  ).toBeTruthy();
});

test('filterProject does NOT match when search text is missing from name and description', () => {
  expect(filterProject(projectWithoutStats, 'NOTHING', new Date())).toBeFalsy();
});
