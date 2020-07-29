import { pipeP } from "../pipe"
import { Parser_, Schema_ } from "../../types"
import { objectP } from "../object"
import { liftP } from "../lift"
import { entries, fromEntries } from "../../utils"
import { mkSchema } from "../factories/mkSchema"
import { mkParser_ } from "../factories/mkParser"

export const aMap = mkParser_((a : Map<any, any>) => {
  const ok = a instanceof Map
  return {
    parse_: { ok, msg: l => l.map },
    result_: ok ? a : new Map()
  }
})

export function toMapFromObjectP<A extends symbol | string | number, B>() : Parser_<{ [key in A]: B }, Map<A, B>> {
  // TODO investigate "as any"
  return pipeP(objectP as any, pipeP(liftP(entries as any), liftP(es => new Map(es as any))))
}

export function toObjectFromMap<A extends symbol | string | number, B>() : Parser_<Map<A, B>, { [key in A]: B }> {
  return pipeP(aMap as Parser_<Map<A, B>, Map<A, B>>, pipeP(liftP(map => [...map]), liftP(fromEntries)))
}

export function toMapFromObject<A extends symbol | string | number, B>() : Schema_<{ [key in A]: B }, Map<A, B>> {
  return mkSchema(
    toMapFromObjectP<A, B>(),
    toObjectFromMap()
  )
}

