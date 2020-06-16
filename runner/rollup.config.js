import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import globals from 'rollup-plugin-node-globals'
import builtins from 'builtin-modules'
/*

export default {
  input: ['src/index.js', 'src/server'],
  output: {
    dir: 'dist',
    sourcemap: 'inline',
    format: 'cjs',
    name: 'app'
  },
  external: builtins,
  plugins: [
    globals(),
    commonjs({
      include: ['src/server/!**', 'node_modules/!**'],
      transformMixedEsModules: true
    }),
    resolve({
      browser: false
    }),
    json(),
    babel({
      plugins: ['@babel/plugin-proposal-class-properties'],
    }),
  ],
}
*/

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundle.index.js',
    format: 'cjs',
    name: 'MyModule'
  },
  external:[... builtins, 'fsevents'],
  plugins: [ resolve({browser: false}), commonjs({exclude: ['node_modules/**']}), globals(), json()]
};
