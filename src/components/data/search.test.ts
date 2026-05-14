import { describe, it, expect } from 'vitest';
import { useSearch } from './search';

describe('Search Logic', () => {
  it('should update filtered projects and reflect tag counts', () => {
    const { allProjects, selectedTags, filteredProjects } = useSearch();
    
    allProjects.value = [
      { id: '1', name: 'Project A', tags: ['vue', 'js'] },
      { id: '2', name: 'Project B', tags: ['vue', 'ts'] },
      { id: '3', name: 'Project C', tags: ['react'] },
    ];

    // Apply filter
    selectedTags.value = ['vue'];
    
    expect(filteredProjects.value.length).toBe(2);
    
    // Verify that logic for tag counts (if implemented in component) 
    // would see only 'vue', 'js', and 'ts' tags.
    const tags = filteredProjects.value.flatMap(p => p.tags);
    expect(tags).toContain('vue');
    expect(tags).toContain('js');
    expect(tags).toContain('ts');
    expect(tags).not.toContain('react');
  });
});