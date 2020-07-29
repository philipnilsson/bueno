import { mkParser_ } from './factories/mkParser'
import { Parser_, Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'

export function lessThanP<A>(lb : A) : Parser_<A, A> {
  return mkParser_(a => ({
    validate_: { msg: l => l.less(lb), ok: a < lb },
    result_: typeof a === typeof lb ? a : lb
  }))
}

export function lessThan(ub : number) : Schema_<number, number> {
  const v = lessThanP(ub)
  return mkSchema(v, v)
}
