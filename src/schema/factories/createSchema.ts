import { mkParser } from "./mkParser"
import { mkSchema } from "./mkSchema"
import { SchemaFactory, Schema_ } from "../../types"
import { irreversible } from "../irreversible"

export function createSchema<A, B>(
  parse : SchemaFactory<A, B>,
  unparse : SchemaFactory<B, A> = irreversible('createSchema')
) : Schema_<A, B> {
  return mkSchema(
    mkParser(parse),
    mkParser(unparse)
  )
}
