/* eslint block-scoped-var: "off" */

/// <reference types="node" />

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['showdown', 'whatwg-fetch', 'promise-polyfill'], (
  /** @type {import('showdown')} */ showdown
) => {
  const { fetch } = window;

  function loadProjects() {
    return fetch('/javascripts/projects.json')
      .then((response) => response.json())
      .then((files) => {
        const converter = new showdown.Converter();

        return Object.keys(files).map((key) => ({
          ...files[key],
          desc: converter.makeHtml(files[key].desc),
        }));
      })
      .catch((error) => {
        console.error('Unable to load project files', error);
        return [];
      });
  }

  return loadProjects;
});
