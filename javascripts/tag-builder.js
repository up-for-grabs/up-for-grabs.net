/* eslint block-scoped-var: "off" */

/** @typedef {{name: string, frequency: number, projects: Array<unknown>}} TagValue */

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['underscore'], (/** @type {import('underscore')} */ _) => {
  class TagBuilder {
    constructor() {
      /** @type {Map<string,TagValue>} */
      const tagsMap = new Map();
      /** @type {Array<TagValue>} */
      let _orderedTagsMap = [];

      this.addTag = function (
        /** @type {string} */ tag,
        /** @type {string} */ projectName
      ) {
        const tagLowerCase = tag.toLowerCase();
        const existing = tagsMap.get(tagLowerCase);
        if (existing) {
          existing.projects.push(projectName);
          tagsMap.set(tagLowerCase, {
            ...existing,
            frequency: (existing.frequency += 1),
          });
        } else {
          tagsMap.set(tagLowerCase, {
            name: tag,
            frequency: 1,
            projects: [projectName],
          });
        }
      };

      this.getTagsMap = function () {
        // https://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
        if (_orderedTagsMap.length === 0) {
          _orderedTagsMap = _([...tagsMap.values()])
            .chain()
            .sortBy((item) => item.name)
            .sortBy((item) => item.frequency * -1)
            .value();
        }

        return _orderedTagsMap;
      };
    }
  }

  return TagBuilder;
});
