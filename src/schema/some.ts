import { Parser, Parser_, Schema, Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { anyP } from './any'
import { eitherP } from './either'
import { isEmpty, getParse, getUnparse } from '../utils'

export function someP<A, B>(
  vs : Parser<A, B>[]
) : Parser_<A, B> {
  if (isEmpty(vs)) return anyP
  return (vs as any).reduce(eitherP)
}

export function some<A, B>(
  ...vs : Schema<A, B>[]
) : Schema_<A, B> {
  return mkSchema(
    someP(vs.map(getParse)),
    someP(vs.map(getUnparse))
  )
}
