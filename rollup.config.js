const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const filesize = require('rollup-plugin-filesize');

const base = {
  input: './src/index.js',
  plugins: [
    nodeResolve(),
    babel({
      babelrc: false,
      presets: [['jason', { modules: false, runtime: false }]],
    }),
  ],
  external: [
  ],
};

module.exports = [
  {
    ...base,
    output: [
      {
        file: 'dist/yup-by-example.js',
        format: 'cjs',
      },
      {
        file: 'dist/yup-by-example.esm.js',
        format: 'es',
      },
    ],
    plugins: [...base.plugins, filesize()],
  },
];
