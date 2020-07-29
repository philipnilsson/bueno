import { Schema_ } from "../types"
import { mkSchema } from "./factories/mkSchema"
import { pipeP } from "./pipe"
import { stringP } from "./string"
import { mkParser_ } from "./factories/mkParser"

export const emptyStringP = pipeP(stringP, mkParser_(s => ({
  validate_: { msg: l => l.empty, ok: s === '' },
  result_: s
})))

export const emptyString : Schema_<string, string> =
  mkSchema(emptyStringP, emptyStringP)
