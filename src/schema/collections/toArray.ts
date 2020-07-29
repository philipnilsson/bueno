import { mkSchema } from "../factories/mkSchema"
import { Parser_, Schema_ } from "../../types"
import { pipeP } from "../pipe"
import { iterableP } from "./iterable"
import { liftP } from "../lift"

const _toArray : Parser_<Iterable<any>, any[]> =
  pipeP(iterableP(), liftP(a => [...a]))

export function toArrayP<A>() : Parser_<Iterable<A>, A[]> {
  return _toArray
}

export function toArray<A>() : Schema_<Iterable<A>, A[]> {
  return mkSchema(toArrayP(), toArrayP() as Parser_<A[], Iterable<A>>)
}

