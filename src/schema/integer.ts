import { mkParser_ } from "./factories/mkParser"
import { mkSchema } from "./factories/mkSchema"

export const integerP = mkParser_((n : number) => ({
  validate_: { ok: Math.floor(n) === n, msg: l => l.integer },
  result_: Math.floor(n)
}))

export const integer =
  mkSchema(integerP, integerP)


