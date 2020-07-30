import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'

export default {
  input: __dirname + '/src/iife.ts',
  
  output: {
    file: "cdn/bueno.min.js",
    format: 'iife',
  },
  
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
      'IS_DEV': 'false'
    }),
    terser(),
  ],
}
