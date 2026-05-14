import { describe, it, expect } from 'vitest';
import { filterProjects, getTagCounts } from './search';

describe('search logic', () => {
  const mockProjects = [
    { id: '1', tags: ['javascript', 'vue'], name: 'Project A' },
    { id: '2', tags: ['javascript', 'react'], name: 'Project B' },
    { id: '3', tags: ['python', 'django'], name: 'Project C' },
  ];

  it('should update tag counts based on applied filters', () => {
    // Initial state: all tags present
    const initialCounts = getTagCounts(mockProjects);
    expect(initialCounts['javascript']).toBe(2);
    expect(initialCounts['vue']).toBe(1);
    expect(initialCounts['python']).toBe(1);

    // Apply filter: "language: javascript"
    // Assuming filterProjects returns the subset of projects matching the query
    const filteredProjects = filterProjects(mockProjects, 'javascript');
    
    // Verify filtered projects
    expect(filteredProjects).toHaveLength(2);

    // Verify tag counts update to reflect only the remaining projects
    const updatedCounts = getTagCounts(filteredProjects);
    
    expect(updatedCounts['javascript']).toBe(2);
    expect(updatedCounts['vue']).toBe(1);
    expect(updatedCounts['react']).toBe(1);
    // 'python' and 'django' should no longer be in the count or be 0
    expect(updatedCounts['python']).toBeUndefined();
    expect(updatedCounts['django']).toBeUndefined();
  });

  it('should return empty counts when no projects match', () => {
    const filteredProjects = filterProjects(mockProjects, 'nonexistent');
    const counts = getTagCounts(filteredProjects);
    expect(Object.keys(counts)).toHaveLength(0);
  });
});