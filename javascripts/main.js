(function($) {

  var projectsSvc = new ProjectsService(projects),
  		compiledtemplateFn = null
  		projectsPanel = null;

  var renderProjects = function(tags){
  	projectsPanel.html(compiledtemplateFn({
			"projects" : projectsSvc.get(tags),
			"tags" : projectsSvc.getTags(),
			"selectedTags": tags
  	}));

  	projectsPanel.find("select.tags-filter").chosen({
  		no_results_text: "No tags found by that name.",
  		width: "95%"
  	}).val(tags).trigger('chosen:updated').change(function(e) {
  		window.location.href = "/#/tags/" + ($(this).val() || "");
  	});
  };

 	var app = $.sammy(function() {
  	this.get("#/", function(context){
  		renderProjects();
  	});

  	this.get("#/tags/", function(context){
  		renderProjects();
  	});

  	this.get("#/tags/:tags", function(context){
  		var tags = (this.params["tags"] || "").toLowerCase().split(",");
  		renderProjects(tags);
  	});
  });

  $(function() {
  	compiledtemplateFn = _.template($("#projects-panel-template").html());
  	projectsPanel = $("#projects-panel");

  	projectsPanel.on("click", "a.remove-tag", function(e){
  		e.preventDefault();
  		var tags = [];
  		projectsPanel.find("a.remove-tag").not(this).each(function(){
  			tags.push($(this).data("tag"));
  		});
  		var tagsString = tags.join(",");
  		window.location.href = "/#/tags/" + tagsString;
  	});

  	app.raise_errors = true;
  	app.run("#/");
  });
})(jQuery);