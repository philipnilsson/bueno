import { Parser, Parser_, Schema, Schema_ } from "../types"
import { mkParserCallable } from "./factories/core"
import { pairA as pairA } from "../action"
import { and, mapCNF } from "../logic"
import { mapError } from "../Builtins"
import { mkSchema } from "./factories/mkSchema"

export function pairP<A, B, C, D>(
  v : Parser<A, C>,
  w : Parser<B, D>
) : Parser_<[A, B], [C, D]> {
  return mkParserCallable(function(kv : [A, B], inv) {
    const a = kv[0]
    const b = kv[1]
    return pairA(v.run_(a, inv), w.run_(b, inv), (a, b) => {
      return {
        cnf_: () => pairA(
          a.cnf_(),
          b.cnf_(),
          (a, b) => and(
            mapCNF(mapError(m => l => l.at('key', m(l))))(a),
            mapCNF(mapError(m => l => l.at('value', m(l))))(b)
          )
        ),
        res_: () => pairA(a.res_(), b.res_(), (a, b) => [a, b]),
        score_: (a.score_ + b.score_) / 2
      }
    })
  })
}

export function pair<A, B, C, D>(
  v : Schema<A, C>,
  w : Schema<B, D>
) : Schema_<[A, B], [C, D]> {
  return mkSchema(
    pairP(v.parse_, w.parse_),
    pairP(v.unparse_, w.unparse_),
  )
}
