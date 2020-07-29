import { Message } from 'bueno/locale'
import { SchemaFactory, Schema, Schema_, ForgetfulSchema } from '../../types'
import { mkParserHaving } from './mkParserHaving'
import { mkSchema } from './mkSchema'
import { getUnparse, getParse } from '../../utils'

export function mkSchemaHaving<A, B>(
  msg : (msg : Message) => string | Message,
  parse : SchemaFactory<A, B>
) : ForgetfulSchema<A, B> {
  const mk = mkParserHaving(msg, parse)
  return function(...vs : Schema<B, B>[]) : Schema_<A, A> {
    return mkSchema(
      mk(...vs.map(getParse)),
      mk(...vs.map(getUnparse)),
    )
  }
}
