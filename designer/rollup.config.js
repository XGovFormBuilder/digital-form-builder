import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import globals from 'rollup-plugin-node-globals'
import builtins from '@cautionyourblast/rollup-plugin-node-builtins'
import json from '@rollup/plugin-json'
import flow from 'rollup-plugin-flow'

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
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    commonjs({
      include: ['/node_modules/**', '../node_modules/**', '../model/**']
    }),
    builtins({ crypto: false }),
    globals(),
    babel({
      babelHelpers: 'runtime',
      exclude: ['/node_modules/**', '../node_modules/**'],
      presets: [
        '@babel/preset-flow',
        '@babel/react',
        '@babel/preset-env'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-runtime'
      ]
    }),
    json(),
    flow()
  ],
  external: ['react', 'react-dom', 'crypto']
}
