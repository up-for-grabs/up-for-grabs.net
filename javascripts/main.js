// @ts-nocheck

/* eslint no-var: [ "error" ] */

define([
  'jquery',
  'projectLoader',
  'projectsService',
  'fetchIssueCount',
  'underscore',
  'sammy',
  // this will auto-run and apply the event listeners for dark mode checks
  'dark-mode',
  // chosen is listed here as a dependency because it's used from a jQuery
  // selector, and needs to be ready before this code runs
  'chosen',
], (
  $,
  loadProjects,
  ProjectsService,
  fetchIssueCount,
  _,
  sammy,
  setupDarkModeListener
) => {
  let compiledtemplateFn = null,
    projectsPanel = null;

  setupDarkModeListener();

  const getFilterUrl = function () {
    return location.href.indexOf('/#/filters') > -1
      ? location.href
      : `${location.href}filters`;
  };

  // inspired by https://stackoverflow.com/a/6109105/1363815 until I have a better
  // idea of what we want to do here
  function relativeTime(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
      return `${Math.round(elapsed / 1000)} seconds ago`;
    }
    if (elapsed < msPerHour) {
      return `${Math.round(elapsed / msPerMinute)} minutes ago`;
    }
    if (elapsed < msPerDay) {
      return `${Math.round(elapsed / msPerHour)} hours ago`;
    }
    if (elapsed < msPerMonth) {
      return `about ${Math.round(elapsed / msPerDay)} days ago`;
    }
    if (elapsed < msPerYear) {
      return `about ${Math.round(elapsed / msPerMonth)} months ago`;
    }

    return `about ${Math.round(elapsed / msPerYear)} years ago`;
  }

  const renderProjects = function (projectService, tags, names, labels, date) {
    const allTags = projectService.getTags();

    projectsPanel.html(
      compiledtemplateFn({
        projects: projectService.get(tags, names, labels, date),
        relativeTime,
        tags: allTags,
        popularTags: projectService.getPopularTags(6),
        selectedTags: tags,
        names: projectService.getNames(),
        selectedNames: names,
        labels: projectService.getLabels(),
        selectedLabels: labels,
      })
    );
    date = date || 'invalid';
    projectsPanel
      .find(`button.radio-btn[id=${date}]`)
      .addClass('radio-btn-selected');
    projectsPanel
      .find('select.tags-filter')
      .chosen({
        no_results_text: 'No tags found by that name.',
        width: '95%',
      })
      .val(tags)
      .trigger('chosen:updated')
      .change(function () {
        location.href = updateQueryStringParameter(
          getFilterUrl(),
          'tags',
          encodeURIComponent($(this).val() || '')
        );
      });

    projectsPanel
      .find('select.names-filter')
      .chosen({
        search_contains: true,
        no_results_text: 'No project found by that name.',
        width: '95%',
      })
      .val(names)
      .trigger('chosen:updated')
      .change(function () {
        location.href = updateQueryStringParameter(
          getFilterUrl(),
          'names',
          encodeURIComponent($(this).val() || '')
        );
      });
    // Logic for checking/unchecking date-buttons
    projectsPanel.find('button.radio-btn').each(function () {
      $(this).click(function () {
        let { id } = this;
        const currentSelected = projectsPanel.find(
          'button.radio-btn-selected'
        )[0];

        // Uncheck
        if (currentSelected && currentSelected.id == id) {
          id = '';
        }

        location.href = updateQueryStringParameter(
          getFilterUrl(),
          'date',
          encodeURIComponent(id || '')
        );
      });
    });

    projectsPanel
      .find('select.labels-filter')
      .chosen({
        no_results_text: 'No project found by that label.',
        width: '95%',
      })
      .val(labels)
      .trigger('chosen:updated')
      .change(function () {
        location.href = updateQueryStringParameter(
          getFilterUrl(),
          'labels',
          encodeURIComponent($(this).val() || '')
        );
      });

    projectsPanel.find('ul.popular-tags li a').each((i, elem) => {
      $(elem).on('click', function () {
        selTags = $('.tags-filter').val() || [];
        selectedTag = preparePopTagName($(this).text() || '');
        if (selectedTag) {
          tagID = allTags
            .map((tag) => tag.name.toLowerCase())
            .indexOf(selectedTag);
          if (tagID !== -1) {
            selTags.push(selectedTag);
            location.href = updateQueryStringParameter(
              getFilterUrl(),
              'tags',
              encodeURIComponent(selTags)
            );
          }
        }
      });
    });
  };

  /*
    This is a utility method to help update a list items Name parameter to make
    it fit URL specification
    @return string - The value of the Name
  */
  let preparePopTagName = function (name) {
    if (name === '') return '';
    return name.toLowerCase().split(' ')[0];
  };

  /**
   * This is a utility method to help update URL Query Parameters
   * @return string - The value of the URL when adding/removing values to it.
   */
  let updateQueryStringParameter = function (uri, key, value) {
    const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, `$1${key}=${value}$2`);
    }

    return `${uri + separator + key}=${value}`;
  };

  /**
   * This function help getting all params in url queryString
   * Taken from here
   * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
   *
   * @return string - value of url params
   */
  const getParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  /**
   * This function adds a button to scroll to top
   * after navigating through a certain screen length
   * Also has corresponding fade-in and fade-out feature
   */
  $(window).scroll(() => {
    const height = $(window).scrollTop();
    if (height > 100) {
      $('#back2Top').fadeIn();
    } else {
      $('#back2Top').fadeOut();
    }
  });
  $(document).ready(() => {
    $('#back2Top').click((event) => {
      event.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      return false;
    });
  });

  /*
   * This is a helper method that prepares the chosen labels/tags/names
   * For HTML and helps display the selected values of each
   * @params String text - The text given, indices or names. As long as it is a string
   * @return Array - Returns an array of split values if given a text. Otherwise undefined
   */
  const prepareForHTML = function (text) {
    return text ? text.toLowerCase().split(',') : text;
  };

  const issueCount = function (project) {
    const a = $(project).find('.label a');
    const gh = a
      .attr('href')
      .match(/github.com(\/[^\/]+\/[^\/]+\/)(?:issues\/)?labels\/([^\/]+)$/);
    let count = a.find('.count');

    if (count.length) {
      return;
    }

    if (!gh) {
      count = $(
        '<span class="count" title="Issue count is only available for projects on GitHub.">?</span>'
      ).appendTo(a);
      return;
    }

    count = $(
      '<span class="count"><img src="images/octocat-spinner-32.gif" /></span>'
    ).appendTo(a);

    const ownerAndName = gh[1];
    const labelEncoded = gh[2];

    fetchIssueCount(ownerAndName, labelEncoded).then(
      (resultCount) => {
        count.html(resultCount);
      },
      (error) => {
        const message = error.message ? error.message : error;
        count.html('?!');
        count.attr('title', message);
      }
    );
  };

  $(() => {
    const $window = $(window),
      onScreen = function onScreen($elem) {
        const docViewTop = $window.scrollTop(),
          docViewBottom = docViewTop + $window.height(),
          elemTop = $elem.offset().top,
          elemBottom = elemTop + $elem.height();
        return (
          (docViewTop <= elemTop && elemTop <= docViewBottom) ||
          (docViewTop <= elemBottom && elemBottom <= docViewBottom)
        );
      };

    $window.on('scroll chosen:updated', () => {
      $('.projects tbody:not(.counted)').each(function () {
        const project = $(this);
        if (onScreen(project)) {
          issueCount(project);
          project.addClass('counted');
        }
      });
    });

    compiledtemplateFn = _.template($('#projects-panel-template').html());
    projectsPanel = $('#projects-panel');

    projectsPanel.on('click', 'a.remove-tag', function (e) {
      e.preventDefault();
      const tags = [];
      projectsPanel
        .find('a.remove-tag')
        .not(this)
        .each(function () {
          tags.push($(this).data('tag'));
        });
      const tagsString = tags.join(',');
      window.location.href = `#/tags/${tagsString}`;
    });

    loadProjects().then((p) => {
      const projectsSvc = new ProjectsService(p);

      const app = sammy(function () {
        /*
         * This is the route used to filter by tags/names/labels
         * It ensures to read values from the URI query param and perform actions
         * based on that. NOTE: It has major side effects on the browser.
         */
        this.get(/\#\/filters/, () => {
          const labels = prepareForHTML(getParameterByName('labels'));
          const names = prepareForHTML(getParameterByName('names'));
          const tags = prepareForHTML(getParameterByName('tags'));
          const date = getParameterByName('date');
          renderProjects(projectsSvc, tags, names, labels, date);
        });

        this.get('/', () => {
          renderProjects(projectsSvc);
        });
      });

      app.raise_errors = true;
      app.run('#/');
    });
  });
});
