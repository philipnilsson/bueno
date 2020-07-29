import { Parser, Parser_, Schema } from "../types"
import { updateMessageP } from "./updateMessage"
import { mkSchema } from "./factories/mkSchema"

export function pathP<A, B>(
  path : string,
  v : Parser<A, B>
) : Parser_<A, B> {
  return updateMessageP(m => l => l.at('_#_' + path, m(l)), v)
}

export function path<A, B>(path : string, v : Schema<A, B>) : Schema<A, B> {
  return mkSchema(pathP(path, v.parse_), pathP(path, v.unparse_))
}


