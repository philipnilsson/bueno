import { Action, all, chain as chainA, pairA } from '../action'
import { CNF, and, mapCNF } from '../logic'
import { Err } from 'bueno/locale'
import { mkParser_ } from './factories/mkParser'
import { Parser, Parser_, Schema, Schema_ } from '../types'
import { pipeP } from './pipe'
import { mkParserCallable } from './factories/core'
import { mapError } from '../Builtins'
import { average, isArray } from '../utils'
import { mkSchema } from './factories/mkSchema'

const arrayType = mkParser_<unknown[], any[]>((a : unknown[]) => {
  const ok = isArray(a)
  return {
    parse_: { ok, msg: l => l.array },
    result_: ok ? a : [],
  }
})

function pairMaybeCNFs(
  a : (Action<CNF<Err>>) | null,
  b : (Action<CNF<Err>>) | null
) : Action<CNF<Err>> {
  if (a && b) return pairA(a, b, and)
  if (a) return a
  if (b) return b
  return []
}

export function arrayP<A, B>(v : Parser<A, B>) : Parser_<A[], B[]> {
  return pipeP(arrayType, mkParserCallable(function(arr : A[], inv : boolean) {
    return chainA(all(arr.map(a => v.run_(a, inv))), results => {
      return {
        cnf_: () => {
          const ixPassed = results.findIndex(x => x.score_ === 1)
          const ixFailed = results.findIndex(x => x.score_ < 1)
          return pairMaybeCNFs(
            ixPassed < 0 ? null :
              chainA(
                results[ixPassed].cnf_(),
                mapCNF(mapError(m => l => l.atEvery(m(l))))
              ),
            ixFailed < 0 ? null : chainA(
              results[ixFailed].cnf_(),
              mapCNF(mapError(m => l => l.at(`${ixFailed}`, m(l))))
            )
          )
        },
        res_: () => all(results.map(x => x.res_())),
        score_: average(results.map(x => x.score_))
      }
    })
  }))
}

export function array<A, B>(
  v : Schema<A, B>,
) : Schema_<A[], B[]> {
  return mkSchema(
    arrayP(v.parse_),
    arrayP(v.unparse_))
}


