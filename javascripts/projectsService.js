(function(host, _) {
  var applyTagsFilter = function (projects, tagsMap, tags) {
    if (typeof tags === "string") {
      tags = tags.split(",");
    }

    tags = _.map(tags, function(entry){
      return entry && entry.replace(/^\s+|\s+$/g, "");
    });

    if(!tags || !tags.length || tags[0] == "") {
      return projects;
    }

    var projectNames = _.uniq(_.flatten(_.map(tags, function(tag){
      var hit = tagsMap[tag.toLowerCase()];
      return (hit && hit.projects) || [];
    })));

    return _.filter(projects, function(project){
      return _.contains(projectNames, project.name);
    });
  };

  var TagBuilder = function(){
    var _tagsMap = {},
        _orderedTagsMap = null;

    var _addTag = function(tag, projectName) {
      var tagLowerCase = tag.toLowerCase();
      if(!_.has(_tagsMap, tagLowerCase)) {
        _tagsMap[tagLowerCase] = {
          "name": tag,
          "frequency": 0,
          "projects": []
        };
      }
      return _tagsMap[tagLowerCase];
    };

    var _addProjectToTag = function(entry, projectName) {
        entry.projects.push(projectName);
        entry.frequency++;
    };

    this.addTag = function(tag, projectName) {
      var _entry = _addTag(tag, projectName);
      // Skip updating projects and frequency for projects that tagged themselves
      if(tag.toLowerCase() !== projectName.toLowerCase()) {
        _addProjectToTag(_entry, projectName);
      }
    };

    this.addProjectTag = function(projectName) {
      _addProjectToTag(_addTag(projectName, projectName), projectName);
    };

    this.getTagsMap = function() {
      //http://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
      return _orderedTagsMap = _orderedTagsMap || _(_tagsMap).chain().sortBy(function(tag, key){
        return key;
      }).sortBy(function(tag, key){
        return tag.frequency * -1;
      }).value();
    };
  }

  var extractTags = function(projectsData) {
    var tagBuilder = new TagBuilder();
    _.each(projectsData, function(entry){
      _.each(entry.tags, function(tag){
        tagBuilder.addTag(tag, entry.name);
      });
      // create or update tags where project name matches tag
      tagBuilder.addProjectTag(entry.name);
    });
    return tagBuilder.getTagsMap();
  };

  var extractProjectsAndTags = function(projectsData) {
    return {
      "projects": projectsData,
      "tags": extractTags(projectsData)
    };
  };

  var ProjectsService = function (projectsData) {
    var _projectsData = extractProjectsAndTags(projectsData);
    var tagsMap = {};

    var canStoreOrdering = (JSON && sessionStorage && sessionStorage.getItem
                            && sessionStorage.setItem);
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
                         function(i) { return _projectsData.projects[i]; });

    _.each(_projectsData.tags, function(tag){
      tagsMap[tag.name.toLowerCase()] = tag;
    });

    this.get = function(tags){
      return applyTagsFilter(projects, tagsMap, tags);
    };

    this.getTags = function() {
      return tagsMap;
    };

    this.getPopularTags = function (popularTagCount) {
      return _.take(_.values(tagsMap), popularTagCount || 10);
    }
  };

  host.ProjectsService = ProjectsService;

})(window, _);
