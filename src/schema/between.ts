import { mkParser_ } from "./factories/mkParser"
import { mkSchema } from "./factories/mkSchema"
import { Parser_, Schema_ } from "../types"

function betweenP<A>(lb : A, ub : A) : Parser_<A, A> {
  return mkParser_(a => ({
    validate_: { msg: l => l.between(lb, ub), ok: a >= lb && a <= ub },
    result_: typeof a === typeof lb ? a : lb
  }))
}

export function between(lb : number, ub : number) : Schema_<number, number> {
  const v = betweenP(lb, ub)
  return mkSchema(v, v)
}
