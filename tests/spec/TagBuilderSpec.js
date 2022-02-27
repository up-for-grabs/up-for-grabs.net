const TagBuilder = require('../../javascripts/tag-builder');

describe('ProjectsService', () => {
  let tagBuilder;

  beforeEach(() => {
    tagBuilder = new TagBuilder();
  });

  it('can add a tag to the builder', () => {
    tagBuilder.addTag('tag', 'some-project');
    expect(tagBuilder.getTagsMap()).toEqual([
      { name: 'tag', frequency: 1, projects: ['some-project'] },
    ]);
  });

  it('can merge projects into same tag', () => {
    tagBuilder.addTag('tag', 'some-project');
    tagBuilder.addTag('tag', 'another-project');
    tagBuilder.addTag('tag', 'yet-another-project');
    expect(tagBuilder.getTagsMap()).toEqual([
      {
        name: 'tag',
        frequency: 3,
        projects: ['some-project', 'another-project', 'yet-another-project'],
      },
    ]);
  });
});
