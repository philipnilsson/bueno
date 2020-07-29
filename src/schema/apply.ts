import { Parser, Parser_, Schema, Schema_ } from "../types"
import { mkParserCallable } from "./factories/core"
import { mkSchema } from "./factories/mkSchema"
import { pathP } from "./path"

export function applyP<A, B>(
  v : Parser<A, B>,
  val : A,
) : Parser_<any, B> {
  return mkParserCallable((_, inv) => v.run_(val, inv))
}

export function apply<A>(
  v : Schema<A, A>,
  value : A,
  path : string
) : Schema_<any, A> {
  return mkSchema(
    pathP(path, applyP(v.parse_, value)),
    pathP(path, applyP(v.unparse_, value))
  )
}


