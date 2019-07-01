var _ = require("underscore");

var sampleProjects = require("../src/sampleProjects");
var ProjectsService = require("../../javascripts/projectsService");

describe("ProjectsService", function() {
  var projectsService;

  beforeEach(function() {
    projectsService = new ProjectsService(sampleProjects);
  });

  it("should be defined", function() {
    expect(projectsService).toBeDefined();
  });

  it("should have get method defined", function() {
    expect(projectsService.get).toBeDefined();
  });

  it("should have getTags method defined", function() {
    expect(projectsService.getTags).toBeDefined();
  });

  it("should return projects list when get method is called", function() {
    expect(projectsService.get()).toBeDefined();
  });

  it("should return tags map when getTags method is called", function() {
    expect(projectsService.getTags()).toBeDefined();
  });

  describe("when instantiated with projects data", function() {
    it("should extract and create tags map from projects data", function() {
      var tags = _.toArray(projectsService.getTags());
      expect(tags).toBeDefined();
    });

    it("should ignore case of tag while creating the tag map", function() {
      var tags = _.toArray(projectsService.getTags());
      expect(tags.length).toBe(15);
    });

    it("should sort the tags by the frequency of occurance and then by name", function() {
      var tags = _.toArray(projectsService.getTags());
      expect(tags[0].name).toBe("API");
      expect(tags[1].name).toBe("ASP.NET");
      expect(tags[2].name).toBe("bindings");
    });
  });

  describe("When filtering by name", function() {
    it("Should return the correct project given the correct index", function() {
      var project = projectsService.get(null, ["1"], undefined);
      expect(project).toBeDefined();
      expect(project[0].name).toBe("LibGit2Sharp");
      expect(project[1]).toBe(undefined);
    });

    it.skip("Should return all projects if given falsy values", function() {
      var projects = projectsService.get(null, true, undefined);

      expect(projects).toBeDefined();

      // TODO: this test is dependent on sort order and may fail because the test
      //       list of projects only contains two projects
      expect(projects[1].name).toBe("Glimpse");
      expect(projects.length).toEqual(2);
    });
  });

  it.skip("should return shuffled projects list  ", function() {
    const firstProject = sampleProjects[0];

    var projects = projectsService.get();

    // TODO: this test is dependent on sort order and may fail because the test
    //       list of projects only contains two projects
    expect(projects[0].name).not.toEqual(firstProject.name);
  });

  describe("when get method is called with no parameters", function() {
    it("should return all the projects", function() {
      var projects = projectsService.get();
      expect(projects.length).toBe(2);
    });
  });

  describe("when get method is called with an empty tags array", function() {
    it("should return all the projects", function() {
      var projects = projectsService.get();
      expect(projects.length).toBe(2);
    });
  });

  describe("when get method is called with matching tags array", function() {
    it("should return all projects associated with those tags", function() {
      var projects = projectsService.get(["web"]);
      expect(projects.length).toBe(1);
    });

    it("should apply case insensitve search for projects associated with those tags", function() {
      var projects = projectsService.get(["WEB"]);
      expect(projects.length).toBe(1);
    });
  });

  describe("when get method is called tags array and none of the tags match", function() {
    it("should return 0 projects", function() {
      var projects = projectsService.get(["D'oh"]);
      expect(projects.length).toBe(0);
    });
  });

  describe("when get method is called with tags parameter as a string", function() {
    it("should return all projects associated with those tags", function() {
      var projects = projectsService.get("web");
      expect(projects.length).toBe(1);
    });

    it("should match the tags after trimming leading and trailing spaces", function() {
      var projects = projectsService.get(" web ");
      expect(projects.length).toBe(1);
    });
  });

  describe("when get method is called with tags array containing both matching and non matching tags", function() {
    it("should return projects for the matching tags and ignore non matching tag", function() {
      var projects = projectsService.get(["c#", "D'oh"]);
      expect(projects.length).toBe(2);
    });
  });

  describe("Expect multiple filters to work tremendously good", function() {
    it("If it doesn't take any filters then it should return projects", function() {
      var projects = projectsService.get(undefined, undefined, undefined);
      expect(projects.length).toBe(2);
    });

    it("Should take a name filter and tag filter with no issues", function() {
      var projects = projectsService.get(["c#"], ["0"], undefined);
      expect(projects.length).toBe(1);
    });

    it("Should take a name filter and wrong tag filter and expect nothing", function() {
      var projects = projectsService.get(["web"], ["1"], undefined);
      expect(projects.length).toBe(0);
    });

    it("Should take a name filter and label filter with no issues", function() {
      var projects = projectsService.get(undefined, ["1"], ["1"]);
      expect(projects.length).toBe(1);
    });

    it("Should take a tag filter and label filter with no issues", function() {
      var projects = projectsService.get(["c#"], undefined, ["1"]);
      expect(projects.length).toBe(1);
    });

    it("Should take all three filters and return a project", function() {
      var projects = projectsService.get(["c#"], ["1"], ["1"]);
      expect(projects.length).toBe(1);
    });
  });
});
