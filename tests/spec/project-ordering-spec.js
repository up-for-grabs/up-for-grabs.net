/**
 * @jest-environment jsdom
 */

const orderAllProjects = require('../../javascripts/project-ordering');

const { sessionStorage: originalSessionStorage } = globalThis;

describe('orderAllProjects', () => {
  beforeEach(() => {
    sessionStorage.removeItem('projectOrder');
  });

  it('returns something when no projects received', () => {
    expect(orderAllProjects([])).toHaveLength(0);
  });

  describe('when items received', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];

    it('will return items in different order when nothing in storage', () => {
      const computeOrder = jest.fn().mockReturnValue([0, 2, 1]);

      expect(orderAllProjects(input, computeOrder)).not.toMatchObject(input);

      expect(computeOrder).toHaveBeenCalledTimes(1);
      expect(computeOrder).toHaveBeenCalledWith(3);
    });

    it('will return items in matching order when stored order is same length', () => {
      sessionStorage.setItem('projectOrder', JSON.stringify([0, 1, 2]));

      const computeOrder = jest.fn();

      expect(orderAllProjects(input, computeOrder)).toMatchObject(input);

      expect(computeOrder).not.toHaveBeenCalled();
    });

    it('will return items in different order when stored order is different length', () => {
      sessionStorage.setItem('projectOrder', JSON.stringify([0, 1]));

      const computeOrder = jest.fn().mockReturnValue([0, 2, 1]);

      expect(orderAllProjects(input, computeOrder)).not.toMatchObject(input);

      expect(computeOrder).toHaveBeenCalled();
    });

    it('will store order in session storage for future lookups', () => {
      const someOrderValue = [0, 2, 1];
      const computeOrder = jest.fn().mockReturnValue(someOrderValue);

      orderAllProjects(input, computeOrder);

      expect(window.sessionStorage.getItem('projectOrder')).toEqual(
        JSON.stringify(someOrderValue)
      );
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

  describe('when no local storage available', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: null,
      });
    });

    afterEach(() => {
      globalThis.sessionStorage = originalSessionStorage;
    });

    it('will return items in same order', () => {
      const input = [{ id: 1 }, { id: 2 }];

      const computeOrder = jest.fn();

      expect(orderAllProjects(input, computeOrder)).toMatchObject(input);

      expect(computeOrder).not.toHaveBeenCalled();
    });
  });
});
