import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import globals from 'rollup-plugin-node-globals'
import builtins from '@cautionyourblast/rollup-plugin-node-builtins'

export default {
  input: 'client/index.js',
  output: {
    file: 'dist/designer.js',
    format: 'iife',
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  },
  plugins: [
    resolve(),
    commonjs({
      include: ['node_modules/**', '../engine/**']
    }),
    globals(),
    babel({
      exclude: 'node_modules/**',
      plugins: ['@babel/plugin-proposal-class-properties'],
      presets: ['@babel/react']
    }),
    builtins()
  ],
  external: ['react', 'react-dom']
}
