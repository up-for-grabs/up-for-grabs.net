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
    
    this.addTag = function(tag, projectName){
      var tagLowerCase = tag.toLowerCase();
      if(!_.has(_tagsMap, tagLowerCase)) {
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

    this.getTagsMap = function(){
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
    var projects = _.toArray(_.shuffle(_projectsData.projects));
		var tagsMap = {};
    
		_.each(_projectsData.tags, function(tag){
      tagsMap[tag.name.toLowerCase()] = tag;
    });

		this.get = function(tags){
      return applyTagsFilter(projects, tagsMap, tags);
		};

    this.getTags = function() {
      return tagsMap;
    };
	};

	host.ProjectsService = ProjectsService;

})(window, _);
