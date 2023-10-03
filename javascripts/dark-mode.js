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

  /* eslint block-scoped-var: "off" */

// Wrap your code in a function to handle possible async operations
async function setupDarkModeListener() {
  // Use a try-catch block for error handling
  try {
    const root = document.documentElement;
    const viewModeElement = document.getElementById('view-mode');
    const viewModeAnchor = document.getElementById('view-mode-a');
    const goBackHomeElement = document.getElementById('go-back-home');

    if (!root || !viewModeElement || !viewModeAnchor || !goBackHomeElement) {
      throw new Error('One or more required elements not found.');
    }

    const storedValue = window.sessionStorage.getItem('mode');
    let lightModeEnabled = !(storedValue && storedValue === 'dark');

    function setDarkMode() {
      root.style.setProperty('--body-back', '#1a2025');
      // Add more style property assignments here for dark mode

      // Update the image sources and title attributes
      goBackHomeElement.setAttribute('src', '/images/logo_dark_1.png');
      viewModeElement.setAttribute('src', '/images/sun-light.png');
      viewModeAnchor.title = 'light-mode';
    }

    function setLightMode() {
      root.style.setProperty('--body-back', '#f9f9f9');
      // Add more style property assignments here for light mode

      // Update the image sources and title attributes
      goBackHomeElement.setAttribute('src', '/images/logo.png');
      viewModeElement.setAttribute('src', '/images/Dim-Night.png');
      viewModeAnchor.title = 'dark-mode';
    }

    function updateValue(value) {
      window.sessionStorage.setItem('mode', value);
      lightModeEnabled = value === 'light';
    }

    if (!lightModeEnabled) {
      setDarkMode();
    }

    viewModeAnchor.addEventListener('click', () => {
      if (lightModeEnabled) {
        setDarkMode();
        updateValue('dark');
      } else {
        setLightMode();
        updateValue('light');
      }
    });
  } catch (error) {
    console.error('Error in setupDarkModeListener:', error);
  }
}

// Export the setupDarkModeListener function
export default setupDarkModeListener;
