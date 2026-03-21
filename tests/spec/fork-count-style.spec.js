const fs = require('node:fs');
const path = require('node:path');

describe('ForkCount styles', () => {
  it('uses a non-clickable cursor for the forks badge', () => {
    const componentPath = path.join(
      __dirname,
      '../../src/components/search/ForkCount.vue'
    );
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).toContain('cursor: default;');
    expect(source).not.toContain('cursor: pointer;');
  });
});
