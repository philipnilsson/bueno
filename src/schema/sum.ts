import { ForgetfulValidator, Schema, Schema_ } from "../types"
import { mkParserHaving } from "./factories/mkParserHaving"
import { mkSchema } from "./factories/mkSchema"
import { getParse, getUnparse } from "../utils"

export const sumP : ForgetfulValidator<number[], number> =
  mkParserHaving(
    m => l => l.sum(m(l)),
    (arr : number[]) => ({
      result: arr.reduce((x, y) => x + y, 0),
    }))

export function sum(
  ...vs : Schema<number, any>[]
) : Schema_<number[], number[]> {
  return mkSchema(
    sumP(...vs.map(getParse)),
    sumP(...vs.map(getUnparse)),
  )
}

