import { mkSchema } from "./factories/mkSchema"
import { Action, chain } from "../action"
import { Parser, Parser_, Schema, Schema_ } from "../types"
import { mkParserCallable } from "./factories/core"
import { irreversible } from "./irreversible"

export function selfP<A, B = A>(fn : (a : A) => Action<Parser<A, B>>) : Parser_<A, B> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(fn(a), v => v.run_(a, inv))
  })
}

export function self<A, B = A>(
  from : (a : A) => Action<Schema<A, B>>,
  to : (b : B) => Action<Schema<A, B>> = irreversible('self')
) : Schema_<A, B> {
  return mkSchema(
    mkParserCallable(function(a : A, inv : boolean) {
      return chain(from(a), p => p.parse_.run_(a, inv))
    }),
    mkParserCallable(function(b : B, inv : boolean) {
      return chain(to(b), p => p.unparse_.run_(b, inv))
    }),
  )
}
