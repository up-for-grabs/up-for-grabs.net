const TagBuilder = require('../../javascripts/tag-builder');

describe('TagBuilder', () => {
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

  it('orders tags by frequency', () => {
    tagBuilder.addTag('tag-3', 'tag-3-first');
    tagBuilder.addTag('tag-3', 'tag-3-third');
    tagBuilder.addTag('tag-3', 'tag-3-second');
    tagBuilder.addTag('tag-2', 'tag-2-first');
    tagBuilder.addTag('tag-2', 'tag-2-second');
    tagBuilder.addTag('tag-1', 'tag-1-first');
    expect(tagBuilder.getTagsMap()).toEqual([
      {
        name: 'tag-3',
        frequency: 3,
        projects: ['tag-3-first', 'tag-3-third', 'tag-3-second'],
      },
      {
        name: 'tag-2',
        frequency: 2,
        projects: ['tag-2-first', 'tag-2-second'],
      },
      {
        name: 'tag-1',
        frequency: 1,
        projects: ['tag-1-first'],
      },
    ]);
  });
});
