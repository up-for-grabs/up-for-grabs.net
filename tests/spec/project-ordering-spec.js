/**
 * @jest-environment jsdom
 */

const orderAllProjects = require('../../javascripts/project-ordering');

describe('orderAllProjects', () => {
  it('returns something when no projects received', () => {
    expect(orderAllProjects([], () => [])).toHaveLength(0);
  });

  describe('when items received', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];

    it('returns items in computeOrder order', () => {
      const computeOrder = jest.fn().mockReturnValue([0, 2, 1]);

      expect(orderAllProjects(input, computeOrder)).toMatchObject([
        { id: 1 },
        { id: 3 },
        { id: 2 },
      ]);

      expect(computeOrder).toHaveBeenCalledTimes(1);
      expect(computeOrder).toHaveBeenCalledWith(3);
    });
  });

  describe('stats filtering', () => {
    it('when stats missing, item is included', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

      expect(orderAllProjects(items, () => [0, 2, 1])).toHaveLength(3);
    });

    it('when stats present and zero issue count, item is ignored', () => {
      const items = [
        { id: 1 },
        { id: 2, stats: { 'issue-count': 0 } },
        { id: 3 },
      ];

      expect(orderAllProjects(items, () => [0, 1])).toHaveLength(2);
    });

    it('when stats missing and issue count greater than zero, item is included', () => {
      const items = [
        { id: 1 },
        { id: 2, stats: { 'issue-count': 3 } },
        { id: 3 },
      ];

      expect(orderAllProjects(items, () => [0, 1, 2])).toHaveLength(3);
    });
  });
});
