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

const renderProjects = function (projectService, tags, names, labels, date, page = 1) {
  const allTags = projectService.getTags();
  const projectsPerPage = 15;
  const projects = projectService.get(tags, names, labels, date);
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const paginatedProjects = projects.slice((page - 1) * projectsPerPage, page * projectsPerPage);

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

  $('#page-info').text(`Page ${page} of ${totalPages}`);
  $('#prev-page').prop('disabled', page === 1);
  $('#next-page').prop('disabled', page === totalPages);
};

const handlePagination = function (projectService, tags, names, labels, date) {
  let currentPage = 1;

  $('#prev-page').click(function () {
    if (currentPage > 1) {
      currentPage--;
      renderProjects(projectService, tags, names, labels, date, currentPage);
    }
  });

  $('#next-page').click(function () {
    const totalPages = Math.ceil(projectService.get(tags, names, labels, date).length / 15);
    if (currentPage < totalPages) {
      currentPage++;
      renderProjects(projectService, tags, names, labels, date, currentPage);
    }
  });
};
