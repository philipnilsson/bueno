import { pipeP } from './pipe'
import { stringP } from './string'
import { numberP } from './number'
import { toStringP } from './toString'
import { Parser_, Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'

export const toNumberP : Parser_<string, number> =
  pipeP(stringP, mkParser_((s : string) => {
    const result = Number(s)
    const ok = s !== '' && !isNaN(result)
    return {
      parse_: { ok, msg: l => l.number },
      result_: ok ? result : 0
    }
  }))

export const toNumber : Schema_<string, number> = mkSchema(
  toNumberP,
  pipeP(numberP, toStringP())
)

