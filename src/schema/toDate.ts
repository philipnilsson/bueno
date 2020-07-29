import { pipeP } from "./pipe"
import { stringP } from "./string"
import { mkParser_ } from "./factories/mkParser"
import { mkSchema } from "./factories/mkSchema"
import { dateP, invalidDate } from "./date"

export const toDateP = pipeP(stringP, mkParser_((s : string) => {
  const date = new Date(s)
  const ok = !isNaN(date.getTime())
  return {
    parse_: { ok, msg: l => l.date },
    result_: ok ? date : invalidDate
  }
}))

export const dateToString = pipeP(dateP, mkParser_((date : Date) => {
  const ok =
    !isNaN(date.getTime())
  const str =
    ok ? date.toISOString().split('T')[0] : ''
  return {
    parse_: {
      ok,
      msg: l => l.date
    },
    result_: str
  }
}))

export const toDate = mkSchema(
  toDateP,
  dateToString
)
