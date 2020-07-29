import { Parser, Parser_, Schema, Schema_ } from "../types"
import { mkParserCallable } from "./factories/core"
import { mkSchema } from "./factories/mkSchema"
import { chain } from "../action"

export function defaultToP<A, B>(
  v : Parser<A, B>,
  fallback : B
) : Parser_<A, B> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(v.run_(a, inv), c => ({
      cnf_: c.cnf_,
      res_: c.score_ < 1 ? (() => fallback) : c.res_,
      score_: c.score_
    }))
  })
}

export function defaultTo<A, B>(
  defaultFrom : B,
  schema : Schema<A, B>,
) : Schema_<A, B> {
  return mkSchema(
    defaultToP(schema.parse_, defaultFrom),
    schema.unparse_
  )
}
