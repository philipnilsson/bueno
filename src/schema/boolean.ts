import { Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'

export const booleanP = mkParser_((a : boolean) => {
  const ok = typeof a === 'boolean'
  return {
    parse_: { ok, msg: l => l.bool },
    result_: ok ? a : false,
  }
})

export const boolean : Schema_<boolean, boolean> =
  mkSchema(booleanP, booleanP)
