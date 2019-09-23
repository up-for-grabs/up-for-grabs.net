const sampleProjects = require('../src/sampleProjects');
const ProjectsService = require('../../javascripts/projectsService');

describe('ProjectsService', function() {
  describe('simple project list', function() {
    let projectsService;

    beforeEach(function() {
      projectsService = new ProjectsService(sampleProjects);
    });

    describe('get', function() {
      it('returns expected project count', function() {
        expect(projectsService.get()).toHaveLength(2);
      });

      describe('filtering', function() {
        it('??? happens when number provided as a name', function() {
          const tags = null;
          const names = ['1'];
          const project = projectsService.get(tags, names);

          expect(project).toBeDefined();
          expect(project[0].name).toBe('LibGit2Sharp');
          expect(project[1]).toBe(undefined);
        });

        it('all projects returned when given falsy values', function() {
          const projects = projectsService.get(null, true, undefined);

          expect(projects).toHaveLength(2);

          const projectNames = projects.map(function(p) {
            return p.name;
          });
          expect(projectNames).toContain('Glimpse');
          expect(projectNames).toContain('LibGit2Sharp');
        });

        it('returns single project when providing array of tags', function() {
          const projects = projectsService.get(['web']);
          expect(projects).toHaveLength(1);
        });

        it('array of tags searched using case-insensitve comparison', function() {
          const projects = projectsService.get(['WEB']);
          expect(projects).toHaveLength(1);
        });

        it('array of non-matching tags returns no projects', function() {
          const projects = projectsService.get(['oops']);
          expect(projects).toHaveLength(0);
        });
      });
    });

    describe('getTags', function() {
      it('returns collection of parsed tags', function() {
        expect(projectsService.getTags()).toHaveLength(15);
      });

      it('includes projects assigned each tag', function() {
        const tags = projectsService.getTags();
        expect(tags).toContainEqual({
          name: 'API',
          frequency: 1,
          projects: ['LibGit2Sharp'],
        });
        expect(tags).toContainEqual({
          name: 'C#',
          frequency: 2,
          projects: ['Glimpse', 'LibGit2Sharp'],
        });
        expect(tags).toContainEqual({
          name: 'bindings',
          frequency: 1,
          projects: ['LibGit2Sharp'],
        });
      });
    });

    describe('getPopularTags', function() {
      it('returns 10 tags by default', function() {
        expect(projectsService.getPopularTags()).toHaveLength(10);
      });

      it('returns requested number if specified', function() {
        const tags = projectsService.getPopularTags(1);
        expect(tags).toContainEqual({
          name: 'C#',
          frequency: 2,
          projects: ['Glimpse', 'LibGit2Sharp'],
        });
      });

      it('returns expected top tag', function() {
        expect(projectsService.getPopularTags(1)).toHaveLength(1);
      });

      it('cannot return more than the total tags available', function() {
        const tags = projectsService.getTags();
        expect(projectsService.getPopularTags(99)).toHaveLength(tags.length);
      });
    });

    it.skip('should return shuffled projects list', function() {
      const firstProject = sampleProjects[0];

      const projects = projectsService.get();

      // TODO: this test is dependent on sort order and may fail because the test
      //       list of projects only contains two projects
      expect(projects[0].name).not.toEqual(firstProject.name);
    });

    describe('when get method is called with tags parameter as a string', function() {
      it('should return all projects associated with those tags', function() {
        const projects = projectsService.get('web');
        expect(projects.length).toBe(1);
      });

      it('should match the tags after trimming leading and trailing spaces', function() {
        const projects = projectsService.get(' web ');
        expect(projects.length).toBe(1);
      });
    });

    describe('when get method is called with tags array containing both matching and non matching tags', function() {
      it('should return projects for the matching tags and ignore non matching tag', function() {
        const projects = projectsService.get(['c#', 'Oops']);
        expect(projects.length).toBe(2);
      });
    });

    describe('Expect multiple filters to work tremendously good', function() {
      it('If it does not take any filters then it should return projects', function() {
        const projects = projectsService.get(undefined, undefined, undefined);
        expect(projects.length).toBe(2);
      });

      it('Should take a name filter and tag filter with no issues', function() {
        const projects = projectsService.get(['c#'], ['0'], undefined);
        expect(projects.length).toBe(1);
      });

      it('Should take a name filter and wrong tag filter and expect nothing', function() {
        const projects = projectsService.get(['web'], ['1'], undefined);
        expect(projects.length).toBe(0);
      });

      it('Should take a name filter and label filter with no issues', function() {
        const projects = projectsService.get(undefined, ['1'], ['1']);
        expect(projects.length).toBe(1);
      });

      it('Should take a tag filter and label filter with no issues', function() {
        const projects = projectsService.get(['c#'], undefined, ['1']);
        expect(projects.length).toBe(1);
      });

      it('Should take all three filters and return a project', function() {
        const projects = projectsService.get(['c#'], ['1'], ['1']);
        expect(projects.length).toBe(1);
      });
    });
  });
});
