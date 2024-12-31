requirejs.config({
  baseUrl: 'javascripts',
  paths: {
    underscore:
      '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.2/underscore-min',
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min',
    sammy: '//cdnjs.cloudflare.com/ajax/libs/sammy.js/0.7.6/sammy.min',
    chosen: '//cdnjs.cloudflare.com/ajax/libs/chosen/1.8.7/chosen.jquery.min',
    showdown: '//cdnjs.cloudflare.com/ajax/libs/showdown/2.0.0/showdown.min',
    'promise-polyfill':
      '//cdn.jsdelivr.net/npm/promise-polyfill@8.1.3/dist/polyfill.min',
    'whatwg-fetch': '//cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/dist/fetch.umd',
  },
  shim: {
    chosen: {
      deps: ['jquery'],
    },
  },
});

requirejs(['main']);

// Add a function to handle pagination logic
function paginateProjects(projects, page, limit) {
  const offset = (page - 1) * limit;
  return projects.slice(offset, offset + limit);
}

// Update the renderProjects function to render the correct page of projects
const renderProjects = function (projectService, tags, names, labels, date, page = 1, limit = 15) {
  const allTags = projectService.getTags();
  const projects = projectService.get(tags, names, labels, date);
  const paginatedProjects = paginateProjects(projects, page, limit);

  projectsPanel.html(
    compiledtemplateFn({
      projects: paginatedProjects,
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

  projectsPanel.find('button.radio-btn').each(function () {
    $(this).click(function () {
      let { id } = this;
      const currentSelected = projectsPanel.find(
        'button.radio-btn-selected'
      )[0];

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

  // Add pagination controls
  const totalPages = Math.ceil(projects.length / limit);
  $('#page-info').text(`Page ${page} of ${totalPages}`);
};

// Add event listeners for pagination controls
$(document).ready(function () {
  $('#prev-page').click(function () {
    const currentPage = parseInt($('#page-info').text().match(/Page (\d+)/)[1]);
    renderProjects(projectService, tags, names, labels, date, currentPage - 1);
  });

  $('#next-page').click(function () {
    const currentPage = parseInt($('#page-info').text().match(/Page (\d+)/)[1]);
    renderProjects(projectService, tags, names, labels, date, currentPage + 1);
  });
});
