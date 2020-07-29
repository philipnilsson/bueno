import { Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'
import { isString } from '../utils'

export const stringP = mkParser_((a : string) => {
  const ok = isString(a)
  return {
    parse_: { ok, msg: l => l.string },
    result_: ok ? a : ''
  }
})

export const string : Schema_<string, string> =
  mkSchema(stringP, stringP)
