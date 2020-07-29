import { Schema, ForgetfulValidator, Schema_ } from "../types"
import { mkParserHaving } from "./factories/mkParserHaving"
import { mkSchema } from "./factories/mkSchema"
import { isNumber, getUnparse, getParse } from "../utils"

export const sizeP : ForgetfulValidator<{ size : number }, number> =
  mkParserHaving(
    m => l => l.length(m(l)),
    (arr : { size : number }) => {
      const ok = arr && isNumber(arr.size)
      return {
        parse: { ok, msg: l => l.either([l.array, l.string]) },
        result: ok ? arr.size : 0
      }
    })

export function size<A extends { size : number }>(
  ...vs : Schema<number, any>[]
) : Schema_<A, A> {
  return mkSchema(
    sizeP(...vs.map(getParse)),
    sizeP(...vs.map(getUnparse)),
  )
}
