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
   * @param {HTMLElement} goBackHomeElement
   */
  function setDarkMode(viewModeElement, viewModeAnchor, goBackHomeElement) {
    root.style.setProperty('--body-back', '#1a2025');
    root.style.setProperty('--body-color', '#eeeded');
    root.style.setProperty('--abs', 'rgb(39, 47, 55)');
    root.style.setProperty('--box-shadow-color', 'rgba(27, 30, 33, 0.5)');
    root.style.setProperty('--heading-color', '#7bc6f2');
    root.style.setProperty('--container-border', 'transparent');
    root.style.setProperty('--container-border-alt', '#dbdbdb');
    root.style.setProperty('--databox-bg', '#32404d');
    root.style.setProperty('--databox-text', '#7bceff');

    goBackHomeElement.setAttribute('src', '/images/logo_dark_1.png');
    viewModeElement.setAttribute('src', '/images/sun-light.png');
    viewModeAnchor.title = 'light-mode';
  }

  /**
   * Apply changes to document to put the page into "light" mode
   *
   * @param {HTMLElement} viewModeElement
   * @param {HTMLElement} viewModeAnchor
   * @param {HTMLElement} goBackHomeElement
   */
  function setLightMode(viewModeElement, viewModeAnchor, goBackHomeElement) {
    root.style.setProperty('--body-back', '#f9f9f9');
    root.style.setProperty('--body-color', '#303030');
    root.style.setProperty('--abs', '#FFF');
    root.style.setProperty('--box-shadow-color', 'rgba(0,0,0,0.2)');
    root.style.setProperty('--heading-color', '#005485');
    root.style.setProperty('--container-border', '#eee');
    root.style.setProperty('--databox-bg', '#fff');
    root.style.setProperty('--databox-text', '#2e7ba9');

    goBackHomeElement.setAttribute('src', '/images/logo.png');
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

    const goBackHomeAnchor = document.getElementById('go-back-home-a');
    if (!goBackHomeAnchor) {
      return;
    }

    const goBackHomeElement = document.getElementById('go-back-home');
    if (!goBackHomeElement) {
      return;
    }

    if (!lightModeEnabled) {
      setDarkMode(viewModeElement, viewModeAnchor, goBackHomeElement);
    }

    viewModeAnchor.addEventListener('click', () => {
      if (lightModeEnabled) {
        setDarkMode(viewModeElement, viewModeAnchor, goBackHomeElement);
        updateValue('dark');
      } else {
        setLightMode(viewModeElement, viewModeAnchor, goBackHomeElement);
        updateValue('light');
      }
    });
  }

  return setupDarkModeListener;
});
