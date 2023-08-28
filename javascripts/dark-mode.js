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
   * @param {HTMLElement} viewModeToggleButton
   * @param {HTMLElement} goBackHomeElement
   */
  function setDarkMode(viewModeElement, viewModeToggleButton, goBackHomeElement) {
    goBackHomeElement.setAttribute('src', '/images/logo_dark_1.png');
    viewModeElement.setAttribute('src', '/images/sun-light.png');
    viewModeToggleButton.setAttribute('aria-pressed', 'true');

    root.setAttribute('data-theme-preference', 'dark');
  }

  /**
   * Apply changes to document to put the page into "light" mode
   *
   * @param {HTMLElement} viewModeElement
   * @param {HTMLElement} viewModeToggleButton
   * @param {HTMLElement} goBackHomeElement
   */
  function setLightMode(viewModeElement, viewModeToggleButton, goBackHomeElement) {
    goBackHomeElement.setAttribute('src', '/images/logo.png');
    viewModeElement.setAttribute('src', '/images/Dim-Night.png');
    viewModeToggleButton.setAttribute('aria-pressed', 'false');

    root.setAttribute('data-theme-preference', '');
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

    const viewModeToggleButton = document.getElementById('view-mode-toggle');
    if (!viewModeToggleButton) {
      return;
    }

    const goBackHomeElement = document.getElementById('go-back-home');
    if (!goBackHomeElement) {
      return;
    }

    if (!lightModeEnabled) {
      setDarkMode(viewModeElement, viewModeToggleButton, goBackHomeElement);
    }

    viewModeToggleButton.addEventListener('click', () => {
      if (lightModeEnabled) {
        setDarkMode(viewModeElement, viewModeToggleButton, goBackHomeElement);
        updateValue('dark');
      } else {
        setLightMode(viewModeElement, viewModeToggleButton, goBackHomeElement);
        updateValue('light');
      }
    });
  }

  return setupDarkModeListener;
});
