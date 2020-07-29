import { ForgetfulValidator, Schema, Schema_ } from "../types"
import { mkParserHaving } from "./factories/mkParserHaving"
import { mkSchema } from "./factories/mkSchema"
import { isNumber, getParse, getUnparse } from "../utils"

export const lengthP : ForgetfulValidator<{ length : number }, number> =
  mkParserHaving(
    m => l => l.length(m(l)),
    (l : { length : number }) => {
      const ok = (l !== null && l !== undefined) && isNumber(l.length)
      return {
        parse: { ok, msg: l => l.either([l.array, l.string]) },
        result: ok ? l.length : 0
      }
    })

export function length<A extends { length : number }>(
  ...vs : Schema<number, any>[]
) : Schema_<A, A> {
  return mkSchema(
    lengthP(...vs.map(getParse)),
    lengthP(...vs.map(getUnparse)),
  )
}
