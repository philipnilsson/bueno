import { mkParserCallable } from "./factories/core"
import { Parser_, Schema_ } from "../types"
import { mkSchema } from "./factories/mkSchema"
import { constant } from "../utils"

export function pureP<A>(a : A) : Parser_<any, A> {
  return mkParserCallable(constant({
    cnf_: constant([]),
    res_: constant(a),
    score_: 1
  }))
}

export function pure<A>(
  a : A
) : Schema_<A, A> {
  const p = pureP(a)
  return mkSchema(p, p)
}

