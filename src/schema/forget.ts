import { chain } from '../action'
import { Parser, Parser_, Schema_ } from '../types'
import { mkParserCallable } from './factories/core'
import { id } from './id'
import { mkSchema } from './factories/mkSchema'
import { constant } from '../utils'

export function forgetP<A, B>(v : Parser<A, B>) : Parser_<A, A> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(v.run_(a, inv), r => {
      return {
        cnf_: r.cnf_,
        res_: constant(a),
        score_: r.score_
      }
    })
  })
}

export function forget<A, B>(
  schema : Schema_<A, B>
) : Schema_<A, A> {
  return mkSchema(
    forgetP(schema.parse_),
    id().parse_
  )
}


