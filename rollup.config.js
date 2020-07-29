import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
//import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: [
    __dirname + '/src/index.ts',
    __dirname + '/src/locales/en-US.ts',
    __dirname + '/src/locales/sv-SE.ts',
  ],
  
  output: [
    {
//      sourcemap: true,
      dir: "dist/esm",
      format: 'esm',
    },
    {
//      sourcemap: true,
      dir: "dist/cjs",
      format: 'cjs',
    }
  ],
  
  preserveModules: true,
  
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],

  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    replace({
      'run_': 'R',
      'parse_': 'P',
      'unparse_': 'U',
      'validate_': 'V',
      'result_': 'R',
      'cnf_': 'C',
      'res_': 'R',
      'score_': 'S',
      'article_': 'A',
      'noun_': 'N',
      'name_': 'M',
      'pos_': 'P',
      'neg_': 'N',
      'passive_': 'P',
      'irIs_': 'I',
      'when_': 'W',
      'shouldBe_': 'S',
      'verbs_': 'V',
      'disj_': 'C',
      'IS_DEV': 'process.env.NODE_ENV !== "production"'
    }),
    process.env.NODE_ENV === 'production' && terser(),
  ],
}
