// @ts-nocheck

requirejs.config({
  baseUrl: "javascripts",
  paths: {
    // external scripts hosted on CDN
    underscore:
      "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min",
    jquery: "//cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min",
    sammy: "//cdnjs.cloudflare.com/ajax/libs/sammy.js/0.7.6/sammy.min",
    chosen: "//cdnjs.cloudflare.com/ajax/libs/chosen/1.8.7/chosen.jquery.min",
  },
  shim: {
    // chosen is not UMD-compatible, so we need to use this hook to ensure
    // jquery is loaded as a prerequisite
    chosen: {
      deps: ["jquery"],
    },
  },
});

// after configuring require, load the main script
requirejs(["main"]);
