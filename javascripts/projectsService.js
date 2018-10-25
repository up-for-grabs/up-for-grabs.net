(function (host, _) {
  var applyTagsFilter = function (projects, tagsMap, tags) {
    if (typeof tags === "string") {
      tags = tags.split(",");
    }

    tags = _.map(tags, function (entry) {
      return entry && entry.replace(/^\s+|\s+$/g, "");
    });

    if (!tags || !tags.length || tags[0] == "") {
      return projects;
    }

    var projectNames = _.uniq(_.flatten(_.map(tags, function (tag) {
      var hit = tagsMap[tag.toLowerCase()];
      return (hit && hit.projects) || [];
    })));

    return _.filter(projects, function (project) {
      return _.contains(projectNames, project.name);
    });
  };

  var applyNamesFilter = function (projects, namesMap, names) {
    if (typeof names === "string") {
      names = names.split(",");
    }

    names = _.map(names, function (entry) {
      return entry && entry.replace(/^\s+|\s+$/g, "");
    });
    console.log(names);
    console.log(projects[0]);
    if (!names || !names.length || names[0] == "") {
      return projects;
    }

    var projectNames = _.uniq(_.flatten(_.map(names, function (name) {
      var hit = namesMap[name.toLowerCase()];
      return hit || [];
    })));
    console.log(projectNames);
    return projectNames;
  };
  var applyLabelsFilter = function (projects, labelsMap, labels) {
    if (typeof labels === "string") {
      labels = labels.split(",");
    }

    labels = _.map(labels, function (entry) {
      return entry && entry.replace(/^\s+|\s+$/g, "");
    });

    console.log(labels);
    console.log(projects[0]);
    if (!labels || !labels.length || labels[0] == "") {
      return projects;
    }

    var projectLabels = _.uniq(_.flatten(_.map(labels, function (label) {
      var hit = labelsMap[label.toLowerCase()];
      return hit || [];
    })));
    console.log(projectLabels)

    return _.filter(projects, function (project) {
      return _.contains(labels, project.upforgrabs.name);
    });
  };
  var TagBuilder = function () {
    var _tagsMap = {},
      _orderedTagsMap = null;

    this.addTag = function (tag, projectName) {
      var tagLowerCase = tag.toLowerCase();
      if (!_.has(_tagsMap, tagLowerCase)) {
        _tagsMap[tagLowerCase] = {
          "name": tag,
          "frequency": 0,
          "projects": []
        };
      }
      var _entry = _tagsMap[tagLowerCase];
      _entry.frequency++;
      _entry.projects.push(projectName);
    };

    this.getTagsMap = function () {
      //https://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
      return _orderedTagsMap = _orderedTagsMap || _(_tagsMap).chain().sortBy(function (tag, key) {
        return key;
      }).sortBy(function (tag, key) {
        return tag.frequency * -1;
      }).value();
    };
  }

  var extractTags = function (projectsData) {
    var tagBuilder = new TagBuilder();
    _.each(projectsData, function (entry) {
      _.each(entry.tags, function (tag) {
        tagBuilder.addTag(tag, entry.name);
      });
    });
    return tagBuilder.getTagsMap();
  };

  var extractProjectsAndTags = function (projectsData) {
    return {
      "projects": projectsData,
      "tags": extractTags(projectsData)
    };
  };

  var ProjectsService = function (projectsData) {
    var _projectsData = extractProjectsAndTags(projectsData);
    var tagsMap = {};
    var namesMap = {};
    var labelsMap = {};

    var canStoreOrdering = (JSON && sessionStorage && sessionStorage.getItem &&
      sessionStorage.setItem);
    var ordering = null;
    if (canStoreOrdering) {
      ordering = sessionStorage.getItem("projectOrder");
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
        sessionStorage.setItem("projectOrder", JSON.stringify(ordering));
      }
    }

    var projects = _.map(ordering,
      function (i) {
        return _projectsData.projects[i];
      });

    _.each(_projectsData.tags, function (tag) {
      tagsMap[tag.name.toLowerCase()] = tag;
    });

    _.each(_projectsData.projects, function (project) {
      if (project.name.toLowerCase) {
        namesMap[project.name.toLowerCase()] = project;
      }
    });

    _.each(_projectsData.projects, function (project) {
        labelsMap[project.upforgrabs.name.toLowerCase()] = project.upforgrabs;
      
    });

    this.get = function (tags, names, labels) {
      if (names) {
        return applyNamesFilter(projects, namesMap, names);
      }
      else if(labels) {
        return applyLabelsFilter(projects, labelsMap, labels);
      }
      return applyTagsFilter(projects, tagsMap, tags);
    };

    this.getTags = function () {
      return tagsMap;
    };

    this.getNames = function () {
      return namesMap;
    };

    this.getLabels = function () {
      return labelsMap;
    };

    this.getPopularTags = function (popularTagCount) {
      return _.take(_.values(tagsMap), popularTagCount || 10);
    }
  };

  host.ProjectsService = ProjectsService;

})(window, _);
