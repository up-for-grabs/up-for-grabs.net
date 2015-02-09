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
      window.location.href = "#/tags/" + encodeURIComponent(($(this).val() || ""));
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
    $(document).on("mouseenter focus mouseleave", '.label a', function(){
      var gh = this.href.match(/github.com(\/[^\/]+\/[^\/]+\/)labels\/([^\/]+)$/)
        , url = gh && ('https://api.github.com/repos' + gh[1] + 'issues?labels=' + gh[2])
        , count = $(this).find('.count');
    
      if (gh && !count.length){
        count = $('<span class="count"><img src="images/octocat-spinner-32.gif" /></span>').appendTo(this);
        $.ajax(url)
        .done(function(data, textStatus, jqXHR){
          var rateLimitRemaining = jqXHR.getResponseHeader('X-RateLimit-Remaining'),
              rateLimitReset = jqXHR.getResponseHeader('X-RateLimit-Reset');
          count.html(data && typeof data.length === 'number' ? data.length.toString() : '?');
        })
        .fail(function(jqXHR, textStatus, errorThrown){
          console.log(jqXHR);
          count.html('?');
          count.attr('title','Could not get issue count from GitHub: ' + errorThrown);
        });
      }
    });
      
    compiledtemplateFn = _.template($("#projects-panel-template").html());
    projectsPanel = $("#projects-panel");

    projectsPanel.on("click", "a.remove-tag", function(e){
      e.preventDefault();
      var tags = [];
      projectsPanel.find("a.remove-tag").not(this).each(function(){
        tags.push($(this).data("tag"));
      });
      var tagsString = tags.join(",");
      window.location.href = "#/tags/" + tagsString;
    });

    app.raise_errors = true;
    app.run("#/");
  });
})(jQuery);