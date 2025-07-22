# Client-side Scripting

This document outlines the moving parts that make up how the JS modules are
found and run in the app.

Why do this?

- GitHub Pages does not natively support JS bundles and blocks
  third-party plugins designed for bundling.
- By using the source JS directly without bundling, local development and
  debugging of the live site is significantly easier, especially for new
  contributors who want to start hacking on things
- By writing more granular modules we can build up a meaningful set of tests
  to ensure we don't regress the website over time

## Launch Flow

This section outlines the runtime steps the app performs to load and process
client-side scripts.

### Initialize RequireJS

[RequireJS](http://requirejs.org) is a module loader designed for use in the
browser, and Up-For-Grabs uses this to compose together the application at
runtime without needing additional tools like bundlers.

When loading the website, this script resource is the entry point to loading
the additional client-side resources:

```html
<script
  src="{{ site.github.url }}javascripts/lib/require.js"
  data-main="javascripts/app"
></script>
```

The `data-main` attribute tells RequireJS what script to run after it is
initialized.

### Configure RequireJS

The `javascripts/app.js` resource configures the application and launches the
main script.

```js
requirejs.config({
  // the default directory to use to find and load resources
  baseUrl: 'javascripts',
  paths: {
    // external scripts hosted on CDN
    underscore:
      '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min',
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min',
    sammy: '//cdnjs.cloudflare.com/ajax/libs/sammy.js/0.7.6/sammy.min',
    chosen: '//cdnjs.cloudflare.com/ajax/libs/chosen/1.8.7/chosen.jquery.min',
  },
  shim: {
    // chosen is not UMD-compatible, so we need to use this hook to ensure
    // jquery is loaded as a prerequisite
    chosen: {
      deps: ['jquery'],
    },
  },
});

// after configuring require, load the main script
requirejs(['main']);
```

If you wish to consume a third-party dependency in the Up-For-Grabs client-side
scripting, it will need to be added here.

### Main Script

The `javascripts/main.js` contains the application-specific logic for the rest
of the application.

```js
define([
  'jquery',
  'projectsService',
  'underscore',
  'sammy',
  // chosen is listed here as a dependency because it's used from a jQuery
  // selector, and needs to be ready before this code runs
  'chosen',
], ($, ProjectsService, _, sammy) => {
  // application code goes here
});
```

If you are adding functionality to the site you will need to follow this
pattern:

- wrap your module in a `define` function
- the first parameter to the function (if needed) is an array of the modules
  that this module depends on
- the second parameter is a function to run, with each of those dependencies as
  parameters
- return an object containing functionality that can then be used by others

This means the use of globals is no longer supported in the codebase, and
dependencies need to be explicitly defined like the snippet above.

## Testing Scripts

Up-For-Grabs now supports using `jest` to run tests inside a NodeJS context.

It uses `babel-jest` which automagically transforms AMD modules into CommonJS
modules.

You can run these tests at any time using `yarn test` to ensure the
functionality covered by tests is not affected by your local changes.

### Testing modules inside `jest`

Because NodeJS only supports CommonJS modules, there's one extra step of setup
if you are writing modules that you would like tested.

Ensure your module defines this _before_ it uses a `define`:

```js
// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}
```
