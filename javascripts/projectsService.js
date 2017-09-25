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



    // MARK: Utility functions for creating tag comparison functions
    var tagNamesForTags = function(tags) {
	return _.map(tags, function (tag) { return tag.name });
    }

    var escapedPatternStrings =  function (strings) {
	return _.map(strings, function (string) { return string.replace(/\+/g, '\\+')// escape any '+' characters e.g. 'c++' => 'c\\+\\+'
						  .replace(/\*/g, '\\*')// escape any '*' characters e.g. 'na*' => 'na\\*'
						  .replace(/\./g, '\\.')// escape any '.' characters e.g. '.NET' => '\\.NET'
						  .replace(/\|/g, '\\.') })
    }

    var escapedPatternStringsForTags = function (tags) {
	return escapedPatternStrings(
	    tagNamesForTags(tags));
    }

    var multiStringAlternativeRegularExpression = function (strings) {
	return new RegExp(strings.join('|').toLowerCase());
    }

    var regexForTags = function (tags) {
	return multiStringAlternativeRegularExpression(
	    escapedPatternStringsForTags(tags));
    }

    var lowerCaseCompareForRegularExpression = function (regularExpression) {
	return function (testee) {
	    return regularExpression.test(testee.toLowerCase());
	}
    }
    // END MARK:

    
    // MARK: Tag Comparison Creation Functions
    var lowerCaseCompareForTags = function (tags) {
	return lowerCaseCompareForRegularExpression(
	    regexForTags(tags));
    }

    var lowerCaseCompareForStrings = function (strings) {
	return lowerCaseCompareForRegularExpression(
	    multiStringAlternativeRegularExpression(
		escapedPatternStrings(strings)));
    }
    // END MARK:

    


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
      //http://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
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




      var validTagsArray = function(tags) {
	  if (typeof tags === "string") {
	      tags = tags.split(",");
	  }
	  var allTagsContainsTag = lowerCaseCompareForTags(tagsMap);
	  
	  return _.filter(tags, function (tag) { return allTagsContainsTag(tag) });
      };

      
      this.get = function (tags) {
	  // Use regular expressions to test for matching and non-matching tags
	  if (tags == null) {
	      return projects;
	  } else {
	      if (typeof tags === "string") {
		  tags = tags.split(",");
	      }
	      tags = validTagsArray(tags);
	      
	      var containsTags = function (project) {		  
		  var projectContainsTag = lowerCaseCompareForStrings(project.tags);
		  
		  for (var i = 0; i < tags.length; i++) {
		      if (!projectContainsTag(tags[i])) {
			  return false;
		      }
		  }
		  return true;      
	      };
	      
	      if (tags.length == 0) {
		  return [];
	      } else {
		  return _.filter(projects, containsTags);
	      }
	  }
      };

    this.getTags = function () {
      return tagsMap;
    };

    this.getPopularTags = function (popularTagCount) {
      return _.take(_.values(tagsMap), popularTagCount || 10);
    }
  };

  host.ProjectsService = ProjectsService;

})(window, _);
