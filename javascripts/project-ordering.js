/* eslint block-scoped-var: "off" */

/** @typedef {{name: string, frequency: number, projects: Array<unknown>}} TagValue */

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  /* eslint-disable-next-line no-var */
  var define = require('amdefine')(module);
}

define(['underscore'], (/** @type {import('underscore')} */ _) => {
  const canStoreOrdering =
    JSON &&
    sessionStorage &&
    'getItem' in sessionStorage &&
    'setItem' in sessionStorage;

  function orderAllProjects(/** @type {Array<unknown>} */ projects) {
    if (!canStoreOrdering) {
      return projects;
    }

    /** @type {Array<number> | null} */
    let ordering = null;

    const orderingValue = sessionStorage.getItem('projectOrder');
    if (orderingValue) {
      ordering = JSON.parse(orderingValue);

      // This prevents anyone's page from crashing if a project is removed
      if (ordering && ordering.length !== projects.length) {
        ordering = null;
      }
    }

    if (!ordering) {
      ordering = _.shuffle(_.range(projects.length));
      if (canStoreOrdering) {
        sessionStorage.setItem('projectOrder', JSON.stringify(ordering));
      }
    }

    return _.map(ordering, (i) => projects[i]);
  }

  return orderAllProjects;
});
