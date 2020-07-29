import { mkSchema } from "./factories/mkSchema"
import { Schema, Schema_ } from "../types"

export function flip<A, B>(schema : Schema<A, B>) : Schema_<B, A> {
  return mkSchema(schema.unparse_, schema.parse_)
}
