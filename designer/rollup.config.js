import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import globals from 'rollup-plugin-node-globals'
import json from '@rollup/plugin-json'

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
    resolve(),
    commonjs({
      include: ['node_modules/**', '../engine/**', '../model/**']
    }),
    globals(),
    babel({
      babelHelpers: 'runtime',
      exclude: ['node_modules/**'],
      presets: [
        '@babel/react',
        '@babel/preset-flow'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-runtime'
      ]
    }),
    json()
  ],
  external: ['react', 'react-dom']
}
