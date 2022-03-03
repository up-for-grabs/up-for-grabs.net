/* eslint block-scoped-var: "off" */

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([], () => {
  const root = document.documentElement;

  /**
   * Apply changes to document to put the page into "dark" mode
   *
   * @param {HTMLElement} viewModeElement
   * @param {HTMLElement} viewModeAnchor
   */
  function setDarkMode(viewModeElement, viewModeAnchor) {
    root.style.setProperty('--body-back', '#111111');
    root.style.setProperty('--body-color', '#eeeded');
    root.style.setProperty('--abs', 'rgb(37, 37, 37)');

    viewModeElement.setAttribute('src', '/images/sun-light.png');
    viewModeAnchor.title = 'light-mode';
  }

  /**
   * Apply changes to document to put the page into "light" mode
   *
   * @param {HTMLElement} viewModeElement
   * @param {HTMLElement} viewModeAnchor
   */
  function setLightMode(viewModeElement, viewModeAnchor) {
    root.style.setProperty('--body-back', '#f9f9f9');
    root.style.setProperty('--body-color', '#303030');
    root.style.setProperty('--abs', '#FFF');

    viewModeElement.setAttribute('src', '/images/Dim-Night.png');
    viewModeAnchor.title = 'dark-mode';
  }

  /**
   * @param {"dark" | "light"} value
   */
  function storeValue(value) {
    window.sessionStorage.setItem('mode', value);
  }

  function setupDarkModeListener() {
    var r = document.querySelector(':root');
    if (!r) {
      return;
    }

    const viewModeElement = document.getElementById('view-mode');
    if (!viewModeElement) {
      return;
    }

    const viewModeAnchor = document.getElementById('view-mode-a');
    if (!viewModeAnchor) {
      return;
    }

    const root = document.documentElement;

    viewModeAnchor.addEventListener('click', () => {
      if (condition) {
        root.style.setProperty('--body-back', '#111111');
        root.style.setProperty('--body-color', '#eeeded');
        root.style.setProperty('--abs', 'rgb(37, 37, 37)');
        condition = false;
        viewModeElement.setAttribute('src', '/images/sun-light.png');
        viewModeAnchor.title = 'light-mode';
      } else {
        root.style.setProperty('--body-back', '#f9f9f9');
        root.style.setProperty('--body-color', '#303030');
        root.style.setProperty('--abs', '#FFF');
        condition = true;
        viewModeElement.setAttribute('src', '/images/Dim-Night.png');
        viewModeAnchor.title = 'dark-mode';
      }
    });
  }

  return setupDarkModeListener;
});
