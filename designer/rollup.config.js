import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import globals from 'rollup-plugin-node-globals'
import builtins from '@cautionyourblast/rollup-plugin-node-builtins'
import json from '@rollup/plugin-json'
import flow from 'rollup-plugin-flow'
import * as path from 'path'

export default {
  input: 'client/index.js',
  output: {
    file: 'dist/designer.js',
    format: 'iife',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  },
  plugins: [
    builtins({ crypto: false }),
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    commonjs({
      include: ['/node_modules/**', /node_modules/]
    }),
    babel({
      babelHelpers: 'runtime',
      exclude: ['/node_modules/**', '../node_modules/**', /node_modules/],
      presets: [
        '@babel/preset-flow',
        '@babel/react',
        [
          '@babel/preset-env',
          {
            targets: 'defaults, ie >= 11',
            debug: true,
            modules: false
          }
        ]
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-runtime'
      ]
    }),
    json(),
    globals()

  ],
  external: ['react', 'react-dom']
}
