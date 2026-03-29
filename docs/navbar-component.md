# Navbar Component

This document explains the navbar component added to improve site navigation.

## Overview

The navbar provides an easy way for users to navigate between the three main sections of the site:

- "Get Involved" section
- "Projects" section
- "Maintain a Project" section

Without the navbar, users would need to manually scroll through the entire page to find these sections. The navbar makes navigation faster and more intuitive.

## Technical Implementation

The navbar implementation consists of three main parts:

### 1. HTML Structure (`_includes/navbar.html`)

The navbar is structured as a simple navigation element with three anchor links pointing to the main sections of the site:

```html
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <div class="container">
    <ul class="nav-links" role="menubar">
      <li role="none">
        <a href="#i-want-to-get-involved" class="nav-link" role="menuitem"
          >Get Involved</a
        >
      </li>
      <li role="none">
        <a href="#projects" class="nav-link" role="menuitem">Projects</a>
      </li>
      <li role="none">
        <a href="#i-maintain-a-project" class="nav-link" role="menuitem"
          >Maintain a Project</a
        >
      </li>
    </ul>
  </div>
</nav>
```

### 2. CSS Styling

The navbar is styled to be responsive and compatible with both light and dark themes:

- It uses CSS variables to maintain consistent theming
- It's sticky at the top of the viewport for persistent access
- It's fully responsive across all device sizes
- It has visual feedback for active and hover states

### 3. JavaScript Functionality

The navbar includes JavaScript that provides:

- Smooth scrolling to section anchors
- Active state tracking based on scroll position
- Accessibility enhancements
- Performance optimizations with debounced scroll events

## Accessibility

The navbar is built with accessibility in mind:

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Sufficient color contrast for all text
- Focus states for keyboard users
- Touch-friendly targets for mobile users

## Responsive Design

The navbar is responsive across different screen sizes:

- On desktop, it provides ample space between navigation items
- On tablets, it adjusts padding to maintain readability
- On mobile devices, it compacts the layout while maintaining touch targets
- For very small screens, it further reduces font size while keeping links accessible

## Usage

The navbar is automatically included in the site's layout through `_layouts/default.html` and requires no additional configuration.

## Testing

A comprehensive test suite is included in `tests/test-navbar.js` to verify:

1. Navigation links are properly rendered
2. Smooth scrolling functions correctly
3. Active state changes based on scroll position
4. Mobile responsiveness works as expected
5. Dark/light mode compatibility is maintained
