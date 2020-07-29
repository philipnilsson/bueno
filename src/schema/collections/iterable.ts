import { mkParser_ } from "../factories/mkParser"
import { mkSchema } from "../factories/mkSchema"
import { isIterable } from "../../utils"
import { Parser_, Schema_ } from "../../types"

const _iterable = mkParser_((a : Iterable<any>) => {
  const ok = isIterable(a)
  return {
    parse_: { ok, msg: l => l.iterable },
    result_: ok ? a : []
  }
})

export const iterableP = <A>() : Parser_<Iterable<A>, Iterable<A>> => {
  return _iterable
}

export function iterable<A>() : Schema_<Iterable<A>, Iterable<A>> {
  return mkSchema(iterableP(), iterableP())
}

