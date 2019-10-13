// @ts-nocheck

requirejs.config({
  baseUrl: 'javascripts',
  paths: {
    // external scripts hosted on CDN
    underscore:
      '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min',
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min',
    sammy: '//cdnjs.cloudflare.com/ajax/libs/sammy.js/0.7.6/sammy.min',
    chosen: '//cdnjs.cloudflare.com/ajax/libs/chosen/1.8.7/chosen.jquery.min',
    showdown: '//cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min',
    'promise-polyfill':
      '//cdn.jsdelivr.net/npm/promise-polyfill@8.1.3/dist/polyfill.min',
    'whatwg-fetch': '//cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/dist/fetch.umd',
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
