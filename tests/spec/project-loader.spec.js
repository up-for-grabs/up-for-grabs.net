import { afterEach } from 'vitest';

const loadProjects = require('../../javascripts/projectLoader');

describe('projectLoader', () => {
  afterEach(() => {
    vi.clearAllMocks();
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

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const projects = await loadProjects();

    expect(projects).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
