import { Parser_, Schema_ } from "../../types"
import { pipeP } from "../pipe"
import { iterableP } from "./iterable"
import { liftP } from "../lift"
import { mkSchema } from "../factories/mkSchema"
import { anyP } from "../factories/core"

const _toSetP : Parser_<Iterable<any>, Set<any>> =
  pipeP(iterableP(), liftP(a => new Set([...a])))

export function toSetP<A>() : Parser_<Iterable<A>, Set<A>> {
  return _toSetP
}

export function toSet<A>() : Schema_<Iterable<A>, Set<A>> {
  return mkSchema(toSetP<A>(), anyP as Parser_<Set<A>, Iterable<A>>)
}

