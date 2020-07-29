import { pipeP } from "../pipe"
import { Parser, Parser_, Schema, Schema_ } from "../../types"
import { toArrayP } from "./toArray"
import { arrayP } from "../array"
import { toSetP } from "./toSet"
import { mkSchema } from "../factories/mkSchema"
import { mkParser_ } from "../factories/mkParser"

const aSet = mkParser_((a : Set<unknown>) => ({
  parse_: { ok: a instanceof Set, msg: l => l.set },
  result_: a instanceof Set ? a : new Set(),
}))

export function setP<A, B>(v : Parser<A, B>) : Parser_<Set<A>, Set<B>> {
  return pipeP(aSet as Parser<Set<A>, Set<A>>, pipeP(toArrayP(), pipeP(arrayP(v), toSetP())))
}

setP.run_ = aSet.run_

export function set<A, B>(v : Schema<A, B>) : Schema_<Set<A>, Set<B>> {
  return mkSchema(setP(v.parse_), setP(v.unparse_))
}

set.parse_ = aSet
set.unparse_ = aSet

