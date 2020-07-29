import { Parser_, Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'
import { Message } from 'bueno/locale'
import { isString } from '../utils'

export function matchP(regex : RegExp, msg : Message) : Parser_<string, string> {
  return mkParser_((s : string) => {
    const result = isString(s) && s.match(regex)
    return {
      validate_: { ok: !!result && result[0] === s, msg },
      result_: s
    }
  })
}

export function match(regex : RegExp, msg : Message) : Schema_<string, string> {
  const v = matchP(regex, msg)
  return mkSchema(v, v)
}
