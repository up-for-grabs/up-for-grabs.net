/* eslint arrow-parens: [ "error", "as-needed" ] */
/* eslint global-require: "off" */
/* eslint block-scoped-var: "off" */

// @ts-nocheck

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['showdown', 'whatwg-fetch', 'promise-polyfill'], showdown => {
  const { fetch } = window;

  function loadProjects() {
    return fetch('/javascripts/projects.json')
      .then(response => response.json())
      .then(files => {
        const converter = new showdown.Converter();

        return Object.keys(files).map(key => ({
          ...files[key],
          desc: converter.makeHtml(files[key].desc),
        }));
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Unable to load project files', error);
        return [];
      });
  }

  return loadProjects;
});
