import { exactlyP } from "./exactly"
import { Parser_, Schema, Schema_, Parser } from "../types"
import { eitherP } from "./either"
import { mkSchema } from "./factories/mkSchema"
import { setMessageP } from "./setMessage"

export function optionalP<A, B>(
  v : Parser<A, B>
) : Parser_<A | undefined, B | undefined> {
  return eitherP(v, setMessageP(exactlyP(undefined), l => l.leftOut))
}

export function optional<A, B>(
  v : Schema<A, B>
) : Schema_<A | undefined, B | undefined> {
  return mkSchema(
    optionalP(v.parse_),
    optionalP(v.unparse_),
  )
}

