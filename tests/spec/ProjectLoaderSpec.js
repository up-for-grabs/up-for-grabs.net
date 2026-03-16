/**
 * @jest-environment jsdom
 */

jest.mock(
  'showdown',
  () => ({
    Converter: class {
      makeHtml(input) {
        return `<p>${input.replace('**Bold**', '<strong>Bold</strong>')}</p>`;
      }
    },
  }),
  { virtual: true }
);

const loadProjects = require('../../javascripts/projectLoader');

describe('projectLoader', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('loads projects and renders markdown descriptions as HTML', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        first: { name: 'Project One', desc: '**Bold** description' },
      }),
      { status: 200, headers: [['Content-Type', 'application/json']] }
    );

    const projects = await loadProjects();

    expect(fetch).toHaveBeenCalledWith('/javascripts/projects.json');
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('Project One');
    expect(projects[0].desc).toContain('<strong>Bold</strong>');
  });

  it('returns an empty list when project loading fails', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const projects = await loadProjects();

    expect(projects).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
