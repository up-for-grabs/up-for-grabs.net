/* eslint global-require: "off" */
/* eslint block-scoped-var: "off" */

// @ts-nocheck

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['showdown', 'whatwg-fetch', 'promise-polyfill'], function(showdown) {
  const { fetch } = window;

  function loadProjects() {
    return fetch('/javascripts/projects.json')
      .then(function(response) {
        return response.json();
      })
      .then(function(files) {
        const projects = [];
        const converter = new showdown.Converter();
        const keys = Object.keys(files);

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          var project = files[key];
          project.desc = converter.makeHtml(project.desc);
          projects.push(project);
        }

        return projects;
      })
      .catch(function(error) {
        // eslint-disable-next-line no-console
        console.error('Unable to load project files', error);
        return [];
      });
  }

  return loadProjects;
});
