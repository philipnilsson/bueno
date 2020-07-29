import { mkParser_ } from './factories/mkParser'
import { Parser_, Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'

export function moreThanP<A>(ub : A) : Parser_<A, A> {
  return mkParser_(a => ({
    validate_: { msg: l => l.more(ub), ok: a > ub },
    result_: typeof a === typeof ub ? a : ub
  }))
}

export function moreThan(lb : number) : Schema_<number, number> {
  const v = moreThanP(lb)
  return mkSchema(v, v)
}
