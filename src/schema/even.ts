import { mkSchema } from "./factories/mkSchema"
import { pipeP } from "./pipe"
import { numberP } from "./number"
import { mkParser_ } from "./factories/mkParser"

export const evenP = pipeP(numberP, mkParser_((a : number) => ({
  validate_: { ok: !(a % 2), msg: l => l.even },
  result_: a
})))

export const even =
  mkSchema(evenP, evenP)

