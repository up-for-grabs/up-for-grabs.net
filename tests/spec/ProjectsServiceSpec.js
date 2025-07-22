/**
 * @jest-environment jsdom
 */

const sampleProjects = require('../src/sampleProjects');
const ProjectsService = require('../../javascripts/projectsService');

describe('ProjectsService', () => {
  describe('simple project list', () => {
    let projectsService;

    beforeEach(() => {
      projectsService = new ProjectsService(sampleProjects);
    });

    describe('get', () => {
      it('returns expected project count', () => {
        expect(projectsService.get()).toHaveLength(2);
      });

      describe('filtering', () => {
        it('??? happens when number provided as a name', () => {
          const tags = null;
          const names = ['1'];
          const project = projectsService.get(tags, names);

          expect(project).toBeDefined();
          expect(project[0].name).toBe('LibGit2Sharp');
          expect(project[1]).toBe(undefined);
        });

        it('returns correct projects when date is set to 1 week', () => {
          const projects = projectsService.get(null, null, null, '1week');

          expect(projects).toHaveLength(1);

          const projectNames = projects.map((p) => p.name);
          expect(projectNames).toContain('LibGit2Sharp'); // Returns because libGit2Sharp is missing stats attribute
        });

        it('returns correct projects when date is set "all"', () => {
          const projects = projectsService.get(null, null, null, 'all');

          expect(projects).toHaveLength(2);

          const projectNames = projects.map((p) => p.name);
          expect(projectNames).toContain('Glimpse');
          expect(projectNames).toContain('LibGit2Sharp'); // Returns because libGit2Sharp is missing stats attribute
        });

        it('all projects returned when given falsy values', () => {
          const projects = projectsService.get(null, true, undefined);

          expect(projects).toHaveLength(2);

          const projectNames = projects.map((p) => p.name);
          expect(projectNames).toContain('Glimpse');
          expect(projectNames).toContain('LibGit2Sharp');
        });

        it('returns single project when providing array of tags', () => {
          const projects = projectsService.get(['web']);
          expect(projects).toHaveLength(1);
        });

        it('array of tags searched using case-insensitive comparison', () => {
          const projects = projectsService.get(['WEB']);
          expect(projects).toHaveLength(1);
        });

        it('array of non-matching tags returns no projects', () => {
          const projects = projectsService.get(['oops']);
          expect(projects).toHaveLength(0);
        });
      });
    });

    describe('getTags', () => {
      it('returns collection of parsed tags', () => {
        expect(projectsService.getTags()).toHaveLength(15);
      });

      it('includes projects assigned each tag', () => {
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

    describe('getPopularTags', () => {
      it('returns 10 tags by default', () => {
        expect(projectsService.getPopularTags()).toHaveLength(10);
      });

      it('returns requested number if specified', () => {
        const tags = projectsService.getPopularTags(1);
        expect(tags).toContainEqual({
          name: 'C#',
          frequency: 2,
          projects: ['Glimpse', 'LibGit2Sharp'],
        });
      });

      it('returns expected top tag', () => {
        expect(projectsService.getPopularTags(1)).toHaveLength(1);
      });

      it('cannot return more than the total tags available', () => {
        const tags = projectsService.getTags();
        expect(projectsService.getPopularTags(99)).toHaveLength(tags.length);
      });
    });

    describe('when get method is called with tags parameter as a string', () => {
      it('should return all projects associated with those tags', () => {
        const projects = projectsService.get('web');
        expect(projects.length).toBe(1);
      });

      it('should match the tags after trimming leading and trailing spaces', () => {
        const projects = projectsService.get(' web ');
        expect(projects.length).toBe(1);
      });
    });

    describe('when get method is called with tags array containing both matching and non matching tags', () => {
      it('should return projects for the matching tags and ignore non matching tag', () => {
        const projects = projectsService.get(['c#', 'Oops']);
        expect(projects.length).toBe(2);
      });
    });

    describe('Expect multiple filters to work tremendously good', () => {
      it('If it does not take any filters then it should return projects', () => {
        const projects = projectsService.get(undefined, undefined, undefined);
        expect(projects.length).toBe(2);
      });

      it('Should take a name filter and tag filter with no issues', () => {
        const projects = projectsService.get(['c#'], ['0'], undefined);
        expect(projects.length).toBe(1);
      });

      it('Should take a name filter and wrong tag filter and expect nothing', () => {
        const projects = projectsService.get(['web'], ['1'], undefined);
        expect(projects.length).toBe(0);
      });

      it('Should take a name filter and label filter with no issues', () => {
        const projects = projectsService.get(undefined, ['1'], ['1']);
        expect(projects.length).toBe(1);
      });

      it('Should take a tag filter and label filter with no issues', () => {
        const projects = projectsService.get(['c#'], undefined, ['1']);
        expect(projects.length).toBe(1);
      });

      it('Should take all three filters and return a project', () => {
        const projects = projectsService.get(['c#'], ['1'], ['1']);
        expect(projects.length).toBe(1);
      });
    });
  });
});
