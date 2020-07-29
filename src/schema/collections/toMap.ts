import { mkSchema } from "../factories/mkSchema"
import { Schema_, Parser_ } from "../../types"
import { pipeP } from "../pipe"
import { liftP } from "../lift"
import { iterableP } from "./iterable"

const _toMap : Parser_<Iterable<any>, Map<any, any>> =
  pipeP(iterableP(), liftP((a => new Map([...a]))))

export function toMapP<A, B>() : Parser_<Iterable<[A, B]>, Map<A, B>> {
  return pipeP(iterableP(), _toMap)
}

export function toMap<A, B>() : Schema_<Iterable<[A, B]>, Map<A, B>> {
  return mkSchema(toMapP(), toMapP() as Parser_<Map<A, B>, Iterable<[A, B]>>)
}

