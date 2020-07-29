import { Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'

export const invalidDate = new Date('')

export const dateP = mkParser_((a : Date) => {
  const ok = a instanceof Date
  return {
    parse_: { ok, msg: l => l.date },
    result_: ok ? a : invalidDate,
  }
})

export const date : Schema_<Date, Date> =
  mkSchema(dateP, dateP)
