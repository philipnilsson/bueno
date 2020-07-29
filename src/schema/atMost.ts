import { Parser_, Schema_ } from "../types"
import { mkParser_ } from "./factories/mkParser"
import { mkSchema } from "./factories/mkSchema"

export function atMostP<A>(ub : A) : Parser_<A, A> {
  return mkParser_(a => ({
    validate_: { msg: l => l.atMost(ub), ok: (a as any) <= ub },
    result_: typeof a === typeof ub ? a : ub
  }))
}

export function atMost(lb : number) : Schema_<number, number> {
  const v = atMostP(lb)
  return mkSchema(v, v)
}

