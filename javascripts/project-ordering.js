/* eslint block-scoped-var: "off" */

/** @typedef {{name:string,desc:string,site:string,tags: Array<string>, upforgrabs: {name:string,link:string}, stats: {issueCount: number,lastUpdated
: string}}} Project */

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  /* eslint-disable-next-line no-var */
  var define = require('amdefine')(module);
}

define(['underscore'], (/** @type {import('underscore')} */ _) => {
  function orderAllProjects(
    /** @type {Array<Project>} */ projects,
    /** @type {(length: number) => Array<number>} */ computeOrder
  ) {
    if (projects.length === 0) {
      return projects;
    }

    const canStoreOrdering =
      JSON &&
      global.sessionStorage &&
      'getItem' in global.sessionStorage &&
      'setItem' in global.sessionStorage;

    if (!canStoreOrdering) {
      return projects;
    }

    /** @type {Array<number> | null} */
    let ordering = null;

    const orderingValue = global.sessionStorage.getItem('projectOrder');
    if (orderingValue) {
      ordering = JSON.parse(orderingValue);

      // This prevents anyone's page from crashing if a project is removed
      if (ordering && ordering.length !== projects.length) {
        ordering = null;
      }
    }

    if (!ordering) {
      ordering = computeOrder(projects.length);
      if (canStoreOrdering) {
        sessionStorage.setItem('projectOrder', JSON.stringify(ordering));
      }
    }

    return _.map(ordering, (i) => projects[i]);
  }

  return orderAllProjects;
});
