/**
 * @jest-environment jsdom
 */

const orderAllProjects = require('../../javascripts/project-ordering');

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
      expect(orderAllProjects(input)).not.toMatchObject(input);
    });

    it('will return items in matching order when something in storage', () => {
      sessionStorage.setItem('projectOrder', JSON.stringify([0, 1, 2]));

      expect(orderAllProjects(input)).toMatchObject(input);
    });

    it('will return items in different order when stored order is different length', () => {
      sessionStorage.setItem('projectOrder', JSON.stringify([0, 2]));

      expect(orderAllProjects(input)).not.toMatchObject(input);
    });
  });

  describe('when no local storage available', () => {
    let oldSessionStorage;

    beforeEach(() => {
      oldSessionStorage = global.sessionStorage;
      global.sessionStorage = null;
    });

    afterEach(() => {
      global.sessionStorage = oldSessionStorage;
    });

    it('will return items in same order', () => {
      const input = [{ id: 1 }, { id: 2 }];
      expect(orderAllProjects(input)).toMatchObject(input);
    });
  });
});
