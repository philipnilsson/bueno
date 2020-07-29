import { mkParser_ } from "./factories/mkParser"
import { Parser_, Schema_ } from "../types"
import { mkSchema } from "./factories/mkSchema"
import '../Builtins'

export function atLeastP<A>(lb : A) : Parser_<A, A> {
  return mkParser_(a => ({
    validate_: { msg: l => l.atLeast(lb), ok: a >= lb },
    result_: typeof a === typeof lb ? a : lb
  }))
}

export function atLeast<A>(lb : A) : Schema_<A> {
  const v = atLeastP(lb)
  return mkSchema(v, v)
}
