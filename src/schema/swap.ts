import { createSchema } from './factories/createSchema'
import { Schema_ } from '../types'

export function swap<A, B>(dict : [B, A][]) : Schema_<A | B, A> {
  return createSchema(
    (a : A | B) => {
      const ix = dict.findIndex(x => x[0] === a)
      return {
        result: (ix >= 0 ? dict[ix][1] : a) as any
      }
    },
    (a : A) => {
      const ix = dict.findIndex(x => x[1] === a)
      return {
        result: ix >= 0 ? dict[ix][0] : a
      }
    },
  )
}
