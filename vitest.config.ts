import { defineConfig } from 'vitest/config'

import babel from 'vite-plugin-babel'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  test: {
    // Jest-like globals
    globals: true,
    // Environment
    environment: 'jsdom',
    // Include below if you want code coverage
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: [
        'vitest-localstorage-mock',
        'tests/setupVitest.ts'
    ],
  },
//    plugins: [
//         babel({
//             babelConfig: {
//                 plugins: ['transform-amd-to-commonjs'],
//             },
//             include: ['javascripts/*.js'],
//         }),
//         commonjs(),
//     ],
})