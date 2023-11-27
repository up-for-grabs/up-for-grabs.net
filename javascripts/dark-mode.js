/* eslint block-scoped-var: "off" */

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([], () => {
  const root = document.querySelector(':root');
  const viewModeElement = document.getElementById('view-mode');
  const viewModeAnchor = document.getElementById('view-mode-a');
  const goBackHomeAnchor = document.getElementById('go-back-home-a');
  const goBackHomeElement = document.getElementById('go-back-home');

  if (!root || !viewModeElement || !viewModeAnchor || !goBackHomeAnchor || !goBackHomeElement) {
    return;
  }

  const storedValue = window.sessionStorage.getItem('mode');
  let lightModeEnabled = !(storedValue && storedValue === 'dark');

  function setMode(mode) {
    const styles = mode === 'dark' ? darkModeStyles : lightModeStyles;
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    const images = mode === 'dark' ? darkModeImages : lightModeImages;
    goBackHomeElement.setAttribute('src', images.goBackHome);
    viewModeElement.setAttribute('src', images.viewMode);
    viewModeAnchor.title = images.title;
  }

  function updateValue(value) {
    window.sessionStorage.setItem('mode', value);
    lightModeEnabled = value === 'light';
  }

  function setupDarkModeListener() {
    if (!lightModeEnabled) {
      setMode('dark');
    }

    viewModeAnchor.addEventListener('click', () => {
      if (lightModeEnabled) {
        setMode('dark');
        updateValue('dark');
      } else {
        setMode('light');
        updateValue('light');
      }
    });
  }

  return setupDarkModeListener;
});
