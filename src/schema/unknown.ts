import { Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { anyP } from './factories/core'

export const unknown : Schema_<unknown, unknown> =
  mkSchema(anyP as any, anyP as any)
