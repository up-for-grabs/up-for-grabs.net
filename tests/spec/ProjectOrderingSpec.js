/**
 * @jest-environment jsdom
 */

const ProjectOrdering = require('../../javascripts/project-ordering');

describe('ProjectOrdering', () => {
  it('returns something when no projects received', () => {
    expect(ProjectOrdering([])).toHaveLength(0);
  });

  it.todo('will return same projects when no local storage available');
});
