import { Parser, Parser_, Schema, Schema_ } from "../../types"
import { pipeP } from "../pipe"
import { aMap } from "./toMapFromObject"
import { pairP } from "../pair"
import { toMapP } from "./toMap"
import { mkSchema } from "../factories/mkSchema"
import { toArrayP } from "./toArray"
import { arrayP } from "../array"

export function mapP<A, B, C, D>(key : Parser<A, C>, val : Parser<B, D>) : Parser_<Map<A, B>, Map<C, D>> {
  return pipeP(aMap, pipeP(toArrayP(), pipeP(arrayP(pairP(key, val)), toMapP())))
}

export function map<A, B, C, D>(k : Schema<A, C>, v : Schema<B, D>) : Schema_<Map<A, B>, Map<C, D>> {
  return mkSchema(
    mapP(k.parse_, v.parse_),
    mapP(k.unparse_, v.unparse_)
  )
}
