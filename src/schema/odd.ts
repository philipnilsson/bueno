import { mkSchema } from "./factories/mkSchema"
import { mkParser_ } from "./factories/mkParser"
import { pipeP } from "./pipe"
import { numberP } from "./number"

export const oddP = pipeP(numberP, mkParser_((a : number) => ({
  validate_: { msg: l => l.odd, ok: !!(a % 2) },
  result_: a
})))

export const odd =
  mkSchema(oddP, oddP)
