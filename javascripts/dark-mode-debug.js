// Diagnostic script to troubleshoot dark mode toggle button
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dark mode debug script loaded');
  
  // Check if dark mode toggle button exists
  const viewModeToggleButton = document.getElementById('view-mode-toggle');
  if (!viewModeToggleButton) {
    console.error('Dark mode toggle button not found!');
    return;
  }
  
  console.log('Dark mode toggle button found:', viewModeToggleButton);
  
  // Add a direct event listener to the button
  viewModeToggleButton.addEventListener('click', function() {
    console.log('Dark mode toggle button clicked!');
    
    // Force toggle between light and dark mode
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme-preference');
    const newTheme = currentTheme === 'dark' ? '' : 'dark';
    
    console.log('Switching from', currentTheme || 'light', 'to', newTheme || 'light');
    
    root.setAttribute('data-theme-preference', newTheme);
    
    // Store the preference
    window.localStorage.setItem('mode', newTheme || 'light');
    
    // Update the button's aria-pressed state
    viewModeToggleButton.setAttribute('aria-pressed', newTheme === 'dark' ? 'true' : 'false');
    
    // Update the button image
    const viewModeElement = document.getElementById('view-mode');
    if (viewModeElement) {
      viewModeElement.setAttribute('src', newTheme === 'dark' ? '/images/sun-light.png' : '/images/Dim-Night.png');
    }
    
    // Update the logo
    const goBackHomeElement = document.getElementById('go-back-home');
    if (goBackHomeElement) {
      goBackHomeElement.setAttribute('src', newTheme === 'dark' ? '/images/logo_dark_1.png' : '/images/logo.png');
    }
  });
});
