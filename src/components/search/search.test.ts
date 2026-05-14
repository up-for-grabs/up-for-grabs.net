import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchResults from './SearchResults.vue';

describe('SearchResults', () => {
  it('updates tag counts when filteredProjects change', async () => {
    const projects = [
      { id: '1', tags: ['vue', 'js'] },
      { id: '2', tags: ['vue'] }
    ];
    
    const wrapper = mount(SearchResults, {
      props: { filteredProjects: projects }
    });

    // Initial check
    expect(wrapper.text()).toContain('vue (2)');
    expect(wrapper.text()).toContain('js (1)');

    // Update props
    await wrapper.setProps({
      filteredProjects: [{ id: '1', tags: ['vue', 'js'] }]
    });

    // Verify dynamic update
    expect(wrapper.text()).toContain('vue (1)');
    expect(wrapper.text()).toContain('js (1)');
  });
});