import { Parser_, Schema_ } from "../types"
import { pipeP } from "./pipe"
import { stringP } from "./string"
import { toStringP } from "./toString"
import { mkParser_ } from "./factories/mkParser"
import { mkSchema } from "./factories/mkSchema"
import { object } from "./object"

export const toJSONP : Parser_<string, any> = pipeP(stringP, mkParser_((s : string) => {
  let result = null
  let ok = false
  try {
    result = JSON.parse(s)
    ok = true
  } catch (e) { }
  return {
    parse_: { ok, msg: l => l.json },
    result_: result
  }
}))

export const toJSON : Schema_<string, any> = mkSchema(
  pipeP(stringP, toJSONP),
  pipeP(object.parse_, toStringP())
)
