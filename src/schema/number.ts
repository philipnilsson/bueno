import { Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'
import { isNumber } from '../utils'

export const numberP = mkParser_((a : number) => {
  const ok = isNumber(a)
  return {
    parse_: { ok, msg: l => l.number },
    result_: ok ? a : 0,
  }
})

export const number : Schema_<number, number> =
  mkSchema(numberP, numberP)
