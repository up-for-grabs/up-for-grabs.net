/* eslint global-require: "off" */
/* eslint block-scoped-var: "off" */
/* eslint prefer-arrow-callback: [ "error" ] */
/* eslint arrow-parens: [ "error", "as-needed" ] */
/* eslint function-paren-newline: [ "off" ] */
/* eslint implicit-arrow-linebreak: [ "off" ] */
/* eslint no-confusing-arrow: [ "off" ] */

// @ts-nocheck

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['underscore'], _ => {
  var applyTagsFilter = function(projects, tagsArray, tags) {
    if (typeof tags === 'string') {
      tags = tags.split(',');
    }

    tags = _.map(tags, entry => entry && entry.replace(/^\s+|\s+$/g, ''));

    if (!tags || !tags.length || tags[0] == '') {
      return projects;
    }

    var projectNames = _.uniq(
      _.flatten(
        _.map(tags, tag => {
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

    return _.filter(projects, project =>
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
  var applyNamesFilter = function(projects, projectNamesSorted, names) {
    if (typeof names === 'string') {
      names = names.split(',');
    }

    names = _.map(names, entry => entry && entry.replace(/^\s+|\s+$/g, ''));

    if (!names || !names.length || names[0] == '') {
      return projects;
    }

    // Make sure the names are sorted first. Then return the found index in the passed names
    return _.filter(
      _.map(projectNamesSorted, (entry, key) => {
        if (names.indexOf(String(key)) > -1) {
          return entry;
        }
      }),
      entry => entry || false
    );
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
  var applyLabelsFilter = function(projects, projectLabelsSorted, labels) {
    label_indices = labels;

    if (typeof labels === 'string') {
      label_indices = labels.split(',');
    }

    labels_indices = _.map(
      labels,
      entry => entry && entry.replace(/^\s+|\s+$/g, '')
    );

    // fallback if labels doesnt exist
    if (!label_indices || !label_indices.length || labels[0] == '') {
      return projects;
    }

    // get the corresponding label from projectLabelsSorted with the indices from earlier
    labels = _.filter(projectLabelsSorted, (entry, key) => {
      if (label_indices.indexOf(String(key)) > -1) {
        return entry;
      }
    });

    // collect the names of all labels into a list
    label_names = _.collect(labels, label => label.name);

    // find all projects with the given labels via OR
    results = _.map(label_names, name =>
      _.filter(
        projects,
        project =>
          String(project.upforgrabs.name).toLowerCase() === name.toLowerCase()
      )
    );

    // the above statements returns n arrays in an array, which we flatten here and return then
    return _.flatten(results, (arr1, arr2) => arr1.append(arr2));
  };

  var TagBuilder = function() {
    var _tagsMap = {},
      _orderedTagsMap = null;

    this.addTag = function(tag, projectName) {
      var tagLowerCase = tag.toLowerCase();
      if (!_.has(_tagsMap, tagLowerCase)) {
        _tagsMap[tagLowerCase] = {
          name: tag,
          frequency: 0,
          projects: [],
        };
      }
      var _entry = _tagsMap[tagLowerCase];
      _entry.frequency++;
      _entry.projects.push(projectName);
    };

    this.getTagsMap = function() {
      // https://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
      return (_orderedTagsMap =
        _orderedTagsMap ||
        _(_tagsMap)
          .chain()
          .sortBy((tag, key) => key)
          .sortBy(tag => tag.frequency * -1)
          .value());
    };
  };

  var extractTags = function(projectsData) {
    var tagBuilder = new TagBuilder();
    _.each(projectsData, entry => {
      _.each(entry.tags, tag => {
        tagBuilder.addTag(tag, entry.name);
      });
    });
    return tagBuilder.getTagsMap();
  };

  var extractProjectsAndTags = function(projectsData) {
    return {
      projects: projectsData,
      tags: extractTags(projectsData),
    };
  };

  var ProjectsService = function(projectsData) {
    var _projectsData = extractProjectsAndTags(projectsData);
    var tagsMap = {};
    var namesMap = {};
    var labelsMap = {};

    var canStoreOrdering =
      JSON &&
      sessionStorage &&
      sessionStorage.getItem &&
      sessionStorage.setItem;
    var ordering = null;
    if (canStoreOrdering) {
      ordering = sessionStorage.getItem('projectOrder');
      if (ordering) {
        ordering = JSON.parse(ordering);

        // This prevents anyone's page from crashing if a project is removed
        if (ordering.length !== _projectsData.projects.length) {
          ordering = null;
        }
      }
    }

    if (!ordering) {
      ordering = _.shuffle(_.range(_projectsData.projects.length));
      if (canStoreOrdering) {
        sessionStorage.setItem('projectOrder', JSON.stringify(ordering));
      }
    }

    var all_projects = _.map(ordering, i => _projectsData.projects[i]);

    var projects = _.filter(all_projects, project =>
      project.stats ? project.stats['issue-count'] > 0 : true
    );

    _.each(_projectsData.tags, tag => {
      tagsMap[tag.name.toLowerCase()] = tag;
    });

    _.each(_projectsData.projects, project => {
      if (project.name.toLowerCase) {
        namesMap[project.name.toLowerCase()] = project;
      }
    });

    _.each(_projectsData.projects, project => {
      labelsMap[project.upforgrabs.name.toLowerCase()] = project.upforgrabs;
    });

    this.get = function(tags, names, labels) {
      var filtered_projects = projects;
      if (names && names.length) {
        filtered_projects = applyNamesFilter(
          filtered_projects,
          this.getNames(),
          names
        );
      }
      if (labels && labels.length) {
        filtered_projects = applyLabelsFilter(
          filtered_projects,
          this.getLabels(),
          labels
        );
      }
      if (tags && tags.length) {
        filtered_projects = applyTagsFilter(
          filtered_projects,
          this.getTags(),
          tags
        );
      }
      return filtered_projects;
    };

    this.getTags = function() {
      return _.sortBy(tagsMap, entry => entry.name.toLowerCase());
    };

    this.getNames = function() {
      return _.sortBy(namesMap, entry => entry.name.toLowerCase());
    };

    this.getLabels = function() {
      return _.sortBy(labelsMap, entry => entry.name.toLowerCase());
    };

    this.getPopularTags = function(popularTagCount) {
      return _.take(_.values(tagsMap), popularTagCount || 10);
    };
  };

  return ProjectsService;
});
