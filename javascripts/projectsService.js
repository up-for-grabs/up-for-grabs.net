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

	var ProjectsService = function (projectsData) {
		var _projectsData = projectsData;
		var projects = _.toArray(_.shuffle(_projectsData.projects));
		var tagsMap = {};
		_.each(_projectsData.tags, function(value, key){
      tagsMap[key.toLowerCase()] = {
        "name": key,
        "projects": value
      };
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
