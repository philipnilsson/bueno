import { chain as chainA } from '../../action'
import { Message } from 'bueno/locale'
import { SchemaFactory, ForgetfulValidator, Parser_ } from "../../types"
import { updateNestedMessagesP } from '../updateNestedMessages'
import { mkParser } from "./mkParser"
import { mkParserCallable } from "./core"
import { constant, compose, toMessage } from '../../utils'

function forgetful<A, B>(v : Parser_<A, B>) : ForgetfulValidator<A, B> {
  return function(...vs) {
    return mkParserCallable(function <C extends A>(a : C, inv : boolean) {
      return chainA(v(...vs).run_(a, inv), r => {
        return {
          cnf_: r.cnf_,
          res_: constant(a),
          score_: r.score_
        }
      })
    })
  }
}

export function mkParserHaving<A, B>(
  msg : (msg : Message) => string | Message,
  factory : SchemaFactory<A, B>
) : ForgetfulValidator<A, B> {
  return forgetful(updateNestedMessagesP(compose(msg, toMessage), mkParser(factory)))
}
