(function ($) {

  var projectsSvc = new ProjectsService(projects),
    compiledtemplateFn = null,
    projectsPanel = null;

  var getFilterUrl = function() {
    return location.href.indexOf('/#/filters') > -1 ? location.href : location.href+ 'filters';
  }

  var renderProjects = function (tags, names, labels) {
    projectsPanel.html(compiledtemplateFn({
      "projects": projectsSvc.get(tags, names, labels),
      "tags": projectsSvc.getTags(),
      "popularTags": projectsSvc.getPopularTags(6),
      "selectedTags": tags,
      "names": projectsSvc.getNames(),
      "selectedNames": names,
      "labels": projectsSvc.getLabels(),
      "selectedLabels": labels
    }));

    projectsPanel.find("select.tags-filter").chosen({
      no_results_text: "No tags found by that name.",
      width: "95%"
    }).val(tags).trigger('chosen:updated').change(function (e) {
      location.href = updateQueryStringParameter(getFilterUrl(), 'tags', encodeURIComponent(($(this).val() || "")));
    });

    projectsPanel.find("select.names-filter").chosen({
      search_contains: true,
      no_results_text: "No project found by that name.",
      width: "95%"
    }).val(names).trigger('chosen:updated').change(function (e) {
      location.href = updateQueryStringParameter(getFilterUrl(), 'names', encodeURIComponent(($(this).val() || "")))
    });

    projectsPanel.find("select.labels-filter").chosen({
      no_results_text: "No project found by that label.",
      width: "95%"
    }).val(labels).trigger('chosen:updated').change(function (e) {
      location.href = updateQueryStringParameter(getFilterUrl(), 'labels', encodeURIComponent(($(this).val() || "")));
    });

    projectsPanel.find("ul.popular-tags").children().each(function(i, elem){
        $(elem).on("click", function(){
            let selTags = ($('.tags-filter').val() || [])
            const selectedTag = preparePopTagName($(this).text() || "");
            if (selectedTag){
                location.href = updateQueryStringParameter(
                    getFilterUrl(), 'tags', encodeURIComponent((selTags))); 
            }
        });
    });

  };

  /*
    This is a utility method to help update a list items Name parameter to make
    it fit URL specification
    @return string - The value of the Name
  */
  var preparePopTagName = function(name) {
      if (name === "") return "";
      return name.toLowerCase().split(" ")[0];
  }

  /**
   * This is a utility method to help update URL Query Parameters
   * @return string - The value of the URL when adding/removing values to it.
   */
  var updateQueryStringParameter = function(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
      return uri + separator + key + "=" + value;
    }
}

  /**
  * This function help getting all params in url queryString
  * Taken from here
  * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  *
  * @return string - value of url params
  */
  var getParameterByName = function(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  /*
   * This is a helper method that prepares the chosen labels/tags/names
   * For HTML and helps display the selected values of each
   * @params String text - The text given, indices or names. As long as it is a string
   * @return Array - Returns an array of splitted values if given a text. Otherwise undefined
   */
  var prepareForHTML = function(text) {
    return text ? text.toLowerCase().split(',') : text;
  }

  var app = $.sammy(function () {

    /*
     * This is the route used to filter by tags/names/labels
     * It ensures to read values from the URI query param and perform actions
     * based on that. NOTE: It has major side effects on the browser.
     */
    this.get('#/filters', function() {
      var labels = prepareForHTML(getParameterByName('labels'));
      var names = prepareForHTML(getParameterByName('names'));
      var tags = prepareForHTML(getParameterByName('tags'));
      renderProjects(tags, names, labels)
    });

    this.get("#/", function (context) {
      renderProjects();
    });

  });

  var storage = (function (global) {
    function set(name, value) {
      try {
        if (typeof (global.localStorage) !== "undefined") {
          global.localStorage.setItem(name, JSON.stringify(value));
        }
      } catch (exception) {
        if ((exception != QUOTA_EXCEEDED_ERR) &&
          (exception != NS_ERROR_DOM_QUOTA_REACHED)) {
          throw exception;
        }
      }
    };

    function get(name) {
      if (typeof (global.localStorage) !== "undefined") {
        return JSON.parse(global.localStorage.getItem(name));
      }
      return undefined;
    };

    return {
      set: set,
      get: get
    };
  })(window);

  var issueCount = function (project) {

    var a = $(project).find('.label a'),
      gh = a.attr('href').match(/github.com(\/[^\/]+\/[^\/]+\/)(?:issues\/)?labels\/([^\/]+)$/),
      url = gh && ('https://api.github.com/repos' + gh[1] + 'issues?labels=' + gh[2]),
      count = a.find('.count');

    if (!!count.length) {
      return;
    }

    if (!gh) {
      count = $('<span class="count" title="Issue count is only available for projects on GitHub.">?</span>').appendTo(a);
      return;
    }

    count = $('<span class="count"><img src="images/octocat-spinner-32.gif" /></span>').appendTo(a);
    var cached = storage.get(gh[1]);
    if (cached && cached.date && new Date(cached.date) >= (new Date() - 1000 * 60 * 60 * 24)) {
      count.html(cached.count);
      return;
    }

    $.ajax(url)
      .done(function (data, textStatus, jqXHR) {
        var resultCount = data && typeof data.length === 'number' ? data.length.toString() : '?';
        count.html(resultCount);
        storage.set(gh[1], {
          "count": resultCount,
          "date": new Date()
        });
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        var rateLimited = jqXHR.getResponseHeader('X-RateLimit-Remaining') === '0',
          rateLimitReset = rateLimited && new Date(1000 * +jqXHR.getResponseHeader('X-RateLimit-Reset')),
          message = rateLimitReset ? 'GitHub rate limit met. Reset at ' + rateLimitReset.toLocaleTimeString() + '.' :
          'Could not get issue count from GitHub: ' + ((jqXHR.responseJSON && jqXHR.responseJSON.message) || errorThrown) + '.';
        count.html('?!');
        count.attr('title', message);
      });
  };

  $(function () {
    var $window = $(window),
      onScreen = function onScreen($elem) {
        var docViewTop = $window.scrollTop(),
          docViewBottom = docViewTop + $window.height(),
          elemTop = $elem.offset().top,
          elemBottom = elemTop + $elem.height();
        return (docViewTop <= elemTop && elemTop <= docViewBottom) ||
          (docViewTop <= elemBottom && elemBottom <= docViewBottom);
      };

    $window.on('scroll chosen:updated', function () {
      $('.projects tbody:not(.counted)')
        .each(function () {
          var project = $(this);
          if (onScreen(project)) {
            issueCount(project);
            project.addClass('counted');
          }
        });
    });

    compiledtemplateFn = _.template($("#projects-panel-template").html());
    projectsPanel = $("#projects-panel");

    projectsPanel.on("click", "a.remove-tag", function (e) {
      e.preventDefault();
      var tags = [];
      projectsPanel.find("a.remove-tag").not(this).each(function () {
        tags.push($(this).data("tag"));
      });
      var tagsString = tags.join(",");
      window.location.href = "#/tags/" + tagsString;
    });

    app.raise_errors = true;
    app.run("#/");
  });
})(jQuery);
