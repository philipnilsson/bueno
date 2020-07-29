import { mkSchema } from "./factories/mkSchema"
import { mkParser_ } from "./factories/mkParser"
import { Parser_, Schema_ } from "../types"
import { mkParserCallable } from "./factories/core"
import { irreversible } from "./irreversible"

const _toString = mkParser_((a : any) => ({
  result_: `${a}`
}))

export function toStringP<A>() : Parser_<A, string> {
  return _toString
}

const schema = mkSchema(
  toStringP<any>(),
  mkParserCallable(irreversible('toString'))
)

export function toString<A>() : Schema_<A, string> {
  return schema
}
