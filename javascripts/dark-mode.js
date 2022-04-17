/* eslint block-scoped-var: "off" */

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([], () => {
  const storedValue = window.sessionStorage.getItem('mode');
  // default to light mode if no stored value found, or stored value is anything else
  let lightModeEnabled = !(storedValue && storedValue === 'dark');

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
    root.style.setProperty('--box-shadow-color', 'rgba(7, 58, 97,0.5)');

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
    root.style.setProperty('--box-shadow-color', 'rgba(0,0,0,0.2)');

    viewModeElement.setAttribute('src', '/images/Dim-Night.png');
    viewModeAnchor.title = 'dark-mode';
  }

  /**
   * Update the stored value for the current mode
   * @param {"dark" | "light"} value
   */
  function updateValue(value) {
    window.sessionStorage.setItem('mode', value);
    lightModeEnabled = value === 'light';
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

    if (!lightModeEnabled) {
      setDarkMode(viewModeElement, viewModeAnchor);
    }

    viewModeAnchor.addEventListener('click', () => {
      if (lightModeEnabled) {
        setDarkMode(viewModeElement, viewModeAnchor);
        updateValue('dark');
      } else {
        setLightMode(viewModeElement, viewModeAnchor);
        updateValue('light');
      }
    });
  }

  return setupDarkModeListener;
});
