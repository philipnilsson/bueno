import { Schema_, Parser, ParseResult } from "../types"
import { Message } from 'bueno/locale'
import { mkSchema } from "./factories/mkSchema"
import { mkParserCallable } from "./factories/core"
import { Action, chain } from "../action"
import { mapCNF } from "../logic"
import { mapError } from "../Builtins"
import { isString } from "../utils"

function fromString(m : string | Message) : Message {
  return isString(m) ? (l => l.fromString(m as string)) : (m as Message)
}

export function updateMessageP<A, B>(
  f : (m : Message) => (string | Message),
  v : Parser<A, B>
) {
  return mkParserCallable(function(a : A, inv : boolean) : Action<ParseResult<B>> {

    return chain(v.run_(a, inv), x => {
      return {
        cnf_: () => chain(x.cnf_(), mapCNF(mapError(e => fromString(f(e))))),
        res_: x.res_,
        score_: x.score_
      }
    })
  })
}

export function updateMessage<A, B>(
  f : (m : Message) => (string | Message),
  v : Schema_<A, B>,
) : Schema_<A, B> {
  return mkSchema(
    updateMessageP(f, v.parse_),
    updateMessageP(f, v.unparse_),
  )
}
