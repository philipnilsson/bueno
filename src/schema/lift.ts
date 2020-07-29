import { Parser_, Schema_ } from "../types"
import { mkParser_ } from "./factories/mkParser"
import { irreversible } from "./irreversible"
import { mkSchema } from "./factories/mkSchema"

export function liftP<A, B>(f : (a : A) => B) : Parser_<A, B> {
  return mkParser_((x : A) => {
    try {
      return { result_: f(x) }
    } catch (e) {
      return {
        parse_: { ok: false, msg: l => l.fromString(e?.message ?? `${e}`) },
        result_: null as any
      }
    }
  })
}

export function lift<A, B>(
  f : (a : A) => B,
  g : (a : B) => A = irreversible('lift'),
) : Schema_<A, B> {
  return mkSchema(liftP(f), liftP(g))
}
