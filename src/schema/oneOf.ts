import { Parser_, Schema_ } from "../types"
import { mkParser_ } from "./factories/mkParser"
import { mkSchema } from "./factories/mkSchema"

export function oneOfP<A>(
  ...choices : A[]
) : Parser_<A, A> {
  return mkParser_(a => {
    const ok = choices.indexOf(a) >= 0
    return {
      validate_: {
        ok,
        msg: l => l.oneOf(choices)
      },
      result_: ok || choices.length === 0 ? a : choices[0]
    }
  })
}

export function oneOf<A>(
  ...choices : A[]
) : Schema_<A, A> {
  const v = oneOfP(...choices)
  return mkSchema(v, v)
}
