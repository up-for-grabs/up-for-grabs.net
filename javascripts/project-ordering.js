/* eslint block-scoped-var: "off" */

/**
 * @typedef {{
 *   name:string,
 *   desc:string,
 *   site:string,
 *   tags: Array<string>,
 *   upforgrabs: {
 *     name:string,
 *     link:string
 *   },
 *   stats: {
 *     'issue-count': number,
 *     'last-updated': string
 *   }
 * }} Project
 * */

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['underscore'], (/** @type {import('underscore')} */ _) => {
  function orderAllProjects(
    /** @type {Array<Project>} */ sourceProjects,
    /** @type {(length: number) => Array<number>} */ computeOrder
  ) {
    if (sourceProjects.length === 0) {
      return sourceProjects;
    }

    const projects = sourceProjects.filter((project) =>
      project.stats ? project.stats['issue-count'] > 0 : true
    );

    const canStoreOrdering =
      JSON &&
      window.sessionStorage &&
      'getItem' in window.sessionStorage &&
      'setItem' in window.sessionStorage;

    if (!canStoreOrdering) {
      return projects;
    }

    const projectsLength = projects.length;

    /** @type {Array<number> | null} */
    let ordering = null;

    const orderingValue = window.sessionStorage.getItem('projectOrder');
    if (orderingValue) {
      ordering = JSON.parse(orderingValue);

      // This prevents anyone's page from crashing if a project is removed
      if (ordering && ordering.length !== projectsLength) {
        ordering = null;
      }
    }

    if (!ordering) {
      ordering = computeOrder(projectsLength);
      if (canStoreOrdering) {
        window.sessionStorage.setItem('projectOrder', JSON.stringify(ordering));
      }
    }

    return _.map(ordering, (i) => projects[i]);
  }

  return orderAllProjects;
});
