/* eslint global-require: "off" */
/* eslint block-scoped-var: "off" */

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
/* eslint function-paren-newline: [ "off" ] */
/* eslint implicit-arrow-linebreak: [ "off" ] */
/* eslint no-confusing-arrow: [ "off" ] */
/* eslint no-var: [ "error" ] */

// @ts-nocheck

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  /* eslint-disable-next-line no-var */
  var define = require('amdefine')(module);
}

define(['underscore', 'tag-builder', 'project-ordering'], (
  _,
  TagBuilder,
  orderAllProjects
) => {
  const applyTagsFilter = function (projects, tagsArray, tags) {
    if (typeof tags === 'string') {
      tags = tags.split(',');
    }

    tags = _.map(tags, (entry) => entry && entry.replace(/^\s+|\s+$/g, ''));

    if (!tags || !tags.length || tags[0] == '') {
      return projects;
    }

    const projectNames = _.uniq(
      _.flatten(
        _.map(tags, (tag) => {
          // NOTE
          // tagsMap is currently an array of items when stored in memory and
          // used here, so the previous check which searched based on a prop was
          // never finding results
          //
          // this is not the most efficient way of searching, but it works
          for (let i = 0; i < tagsArray.length; i++) {
            const t = tagsArray[i];
            if (t.name.toLowerCase() === tag.toLowerCase()) {
              return t.projects;
            }
          }
          return [];
        })
      )
    );

    return _.filter(projects, (project) =>
      _.contains(projectNames, project.name)
    );
  };

  /*
   * The function here is used for front end filtering when given
   * selecting certain projects. It ensures that only the selected projects
   * are returned. If none of the names was added to the filter.
   * Then it fallsback to show all the projects.
   * @param Array projects : An array having all the Projects in _data
   * @param Array projectsNameSorted : This is another array showing all the
   *              projects in a sorted order
   * @param Array names : This is an array with the given name filters.
   */
  const applyNamesFilter = function (projects, projectNamesSorted, names) {
    if (typeof names === 'string') {
      names = names.split(',');
    }

    names = _.map(names, (entry) => entry && entry.replace(/^\s+|\s+$/g, ''));

    if (!names || !names.length || names[0] == '') {
      return projects;
    }

    // Make sure the names are sorted first. Then return the found index in the passed names
    return _.filter(
      _.map(projectNamesSorted, (entry, key) => {
        if (names.indexOf(String(key)) > -1) {
          return entry;
        }

        return undefined;
      }),
      (entry) => entry || false
    );
  };

  /*
   * The function here is used for front end filtering when given
   * selecting certain projects. It ensures that only the selected projects
   * are returned. If none of the dates was added to the filter or the project.stats
   * does not contain the 'last-updated' stat
   * it fallsback to show all the projects.
   * @param Array projects : An array having all the Projects in _data
   * @param dateFilter : This is a string that is correlated to a date in the past i.e, 6months = 6 months in the past.
   */

  const applyDateFilter = function (projects, dateFilter) {
    const date = getDate(dateFilter);
    if (date === null) {
      return projects;
    }

    function checkDate(project) {
      if (!project.stats || !project.stats['last-updated']) {
        return true;
      }

      let lastUpdated = project.stats['last-updated'];
      lastUpdated = new Date(lastUpdated);

      return date <= lastUpdated;
    }

    return projects.filter(checkDate);
  };

  const getDate = function (value) {
    const date = new Date();
    switch (value) {
      case '1week':
        date.setDate(date.getDate() - 7);
        break;
      case '1month':
        date.setMonth(date.getMonth() - 1);
        break;
      case '6months':
        date.setMonth(date.getMonth() - 6);
        break;
      case '1year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      case '2years':
        date.setFullYear(date.getFullYear() - 2);
        break;
      default:
        return null;
    }
    return date;
  };

  /*
   * The function here is used for front end filtering when given
   * selecting certain projects. It ensures that only the selected projects
   * are returned. If none of the labels was added to the filter,
   * it fallsback to show all the projects.
   * @param Array projects : An array having all the Projects in _data
   * @param Array projectLabelsSorted : This is another array showing all the
   *        labels in a sorted order
   * @param Array labels : This is an array with the given label filters.
   */
  const applyLabelsFilter = function (projects, projectLabelsSorted, labels) {
    let labelIndices = labels;

    if (typeof labels === 'string') {
      labelIndices = labels.split(',');
    }

    labelIndices = _.map(
      labels,
      (entry) => entry && entry.replace(/^\s+|\s+$/g, '')
    );

    // fallback if labels does not exist
    if (!labelIndices || !labelIndices.length || labels[0] == '') {
      return projects;
    }

    // get the corresponding label from projectLabelsSorted with the indices from earlier
    labels = _.filter(projectLabelsSorted, (entry, key) => {
      if (labelIndices.indexOf(String(key)) > -1) {
        return entry;
      }

      return undefined;
    });

    // collect the names of all labels into a list
    const labelNames = _.collect(labels, (label) => label.name);

    // find all projects with the given labels via OR
    results = _.map(labelNames, (name) =>
      _.filter(
        projects,
        (project) =>
          String(project.upforgrabs.name).toLowerCase() === name.toLowerCase()
      )
    );

    // the above statements returns n arrays in an array, which we flatten here and return then
    return _.flatten(results, (arr1, arr2) => arr1.append(arr2));
  };

  const extractTags = function (projectsData) {
    const tagBuilder = new TagBuilder();
    _.each(projectsData, (entry) => {
      _.each(entry.tags, (tag) => {
        tagBuilder.addTag(tag, entry.name);
      });
    });
    return tagBuilder.getTagsMap();
  };

  const extractProjectsAndTags = function (projectsData) {
    return {
      projects: projectsData,
      tags: extractTags(projectsData),
    };
  };

  const ProjectsService = function (projectsData) {
    const _projectsData = extractProjectsAndTags(projectsData);
    const tagsMap = {};
    const namesMap = {};
    const labelsMap = {};

    const projects = orderAllProjects(_projectsData.projects, (length) =>
      _.shuffle(_.range(length))
    );

    _.each(_projectsData.tags, (tag) => {
      tagsMap[tag.name.toLowerCase()] = tag;
    });

    _.each(_projectsData.projects, (project) => {
      if (project.name.toLowerCase) {
        namesMap[project.name.toLowerCase()] = project;
      }
    });

    _.each(_projectsData.projects, (project) => {
      labelsMap[project.upforgrabs.name.toLowerCase()] = project.upforgrabs;
    });

    this.get = function (tags, names, labels, date) {
      let filteredProjects = projects;
      if (names && names.length) {
        filteredProjects = applyNamesFilter(
          filteredProjects,
          this.getNames(),
          names
        );
      }
      if (date) {
        filteredProjects = applyDateFilter(filteredProjects, date);
      }
      if (labels && labels.length) {
        filteredProjects = applyLabelsFilter(
          filteredProjects,
          this.getLabels(),
          labels
        );
      }
      if (tags && tags.length) {
        filteredProjects = applyTagsFilter(
          filteredProjects,
          this.getTags(),
          tags
        );
      }
      return filteredProjects;
    };

    this.getTags = function () {
      return _.sortBy(tagsMap, (entry) => entry.name.toLowerCase());
    };

    this.getNames = function () {
      return _.sortBy(namesMap, (entry) => entry.name.toLowerCase());
    };

    this.getLabels = function () {
      return _.sortBy(labelsMap, (entry) => entry.name.toLowerCase());
    };

    this.getPopularTags = function (popularTagCount) {
      return _.take(_.values(tagsMap), popularTagCount || 10);
    };
  };

  return ProjectsService;
});
