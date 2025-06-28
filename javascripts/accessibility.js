// Accessibility enhancements for Up For Grabs

document.addEventListener('DOMContentLoaded', function() {
  // Enhanced Back to Top button functionality
  const backToTopButton = document.getElementById('back2Top');
  
  if (backToTopButton) {
    // Show button when user scrolls down
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Set focus to the top of the page after scrolling
      setTimeout(function() {
        document.querySelector('header').setAttribute('tabindex', '-1');
        document.querySelector('header').focus();
        document.querySelector('header').removeAttribute('tabindex');
      }, 500);
    });
    
    // Initially hide the button
    backToTopButton.style.display = 'none';
  }
  
  // Make filter buttons update aria-pressed state
  const timeFilterButtons = document.querySelectorAll('.radio-btn-row .radio-btn');
  timeFilterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove aria-pressed from all buttons
      timeFilterButtons.forEach(btn => {
        btn.setAttribute('aria-pressed', 'false');
      });
      
      // Set aria-pressed on the clicked button
      this.setAttribute('aria-pressed', 'true');
    });
  });
  
  // Enhance keyboard navigation for project cards
  const projectCards = document.querySelectorAll('.data-box');
  projectCards.forEach(card => {
    card.addEventListener('keydown', function(e) {
      // Enter or Space key triggers the first link in the card
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const primaryLink = this.querySelector('.title a');
        if (primaryLink) {
          primaryLink.click();
        }
      }
    });
  });
});
