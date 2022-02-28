/**
 * @jest-environment jsdom
 */

const orderAllProjects = require('../../javascripts/project-ordering');

const { sessionStorage: originalSessionStorage } = global;

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

    it('will return items in matching order when something in storage', () => {
      sessionStorage.setItem('projectOrder', JSON.stringify([0, 1, 2]));

      const computeOrder = jest.fn();

      expect(orderAllProjects(input, computeOrder)).toMatchObject(input);

      expect(computeOrder).not.toHaveBeenCalled();
    });

    it('will return items in different order when stored order is different length', () => {
      sessionStorage.setItem('projectOrder', JSON.stringify([0, 2]));

      const computeOrder = jest.fn().mockReturnValue([0, 2, 1]);

      expect(orderAllProjects(input, computeOrder)).not.toMatchObject(input);

      expect(computeOrder).toHaveBeenCalled();
    });
  });

  describe('when no local storage available', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'sessionStorage', {
        value: null,
      });
    });

    afterEach(() => {
      global.sessionStorage = originalSessionStorage;
    });

    it('will return items in same order', () => {
      const input = [{ id: 1 }, { id: 2 }];

      const computeOrder = jest.fn();

      expect(orderAllProjects(input, computeOrder)).toMatchObject(input);

      expect(computeOrder).not.toHaveBeenCalled();
    });
  });
});
