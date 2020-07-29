export { notP } from './factories/core'
import { mkSchema, notP } from './factories/core'
import { Schema, Schema_ } from '../types'

export function not<A, B>(v : Schema<A, B>) : Schema_<A, B> {
  return mkSchema(
    notP(v.parse_),
    notP(v.unparse_)
  )
}
