import { expect, test } from 'vitest';
import ForkCount from './ForkCount.vue';

import { mount } from '@vue/test-utils';

test('ForkCount with count rendered text and title', async () => {
  const wrapper = mount(ForkCount, {
    props: {
      forkCount: 1,
    },
  });

  expect(wrapper.text()).toEqual('1');

  expect(wrapper.find('.fork-count').exists()).toBeTruthy();
  expect(wrapper.find('.fork-count').element.getAttribute('title')).toBe(
    'Number of forks'
  );
});

test('ForkCount without count does not render any elements', async () => {
  const wrapper = mount(ForkCount, {
    props: {},
  });

  expect(wrapper.text()).toEqual('');

  expect(wrapper.find('.fork-count').exists()).toBeFalsy();
});
