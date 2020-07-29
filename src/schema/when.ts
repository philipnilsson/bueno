import { mkParserCallable } from "./factories/core"
import { pairA, Action, chain } from "../action"
import { CNF } from "../logic"
import { Err, Message } from 'bueno/locale'
import { Parser, Parser_, Schema, Schema_ } from "../types"
import { anyP } from "./any"
import { negate } from "../Builtins"
import { mkSchema } from "./factories/mkSchema"
import { id } from "./id"

const whenMkError = (
  cond : () => Action<CNF<Err>>,
  conseq : () => Action<CNF<Err>>,
  fscore : number
) : Action<CNF<Err>> => {
  return pairA(cond(), conseq(), (cond, conseq) => {
    const reason =
      cond
        .map(disj => disj.filter(x => x.ok))
        .filter(x => x.length)
    return (
      conseq.filter(disj => disj.some(x => !x.ok)).map(disj => {
        return [{
          k: 'v',
          m: (l => l.when(
            l.either(disj.map(x => x.m(l))),
            reason.map(r => l.either(r.map(e => e.m(l)))),
          )) as Message,
          ok: fscore === 1
        }]
      })
    )
  })
}

export function whenP<A, B>(
  cond : Parser<A, any>,
  consequent : Parser<A, B>,
  alternative : Parser<A, B> = anyP
) : Parser_<A, B> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(cond.run_(a, inv), cond => {
      if (cond.score_ === 1) {
        return chain(consequent.run_(a, false), cons => {
          return {
            cnf_: () => whenMkError(cond.cnf_, cons.cnf_, cons.score_),
            res_: cons.res_,
            score_: cons.score_
          }
        })
      } else {
        return chain(alternative.run_(a, false), alter => ({
          cnf_: () => whenMkError(
            () => chain(cond.cnf_(), negate),
            alter.cnf_, alter.score_),
          res_: alter.res_,
          score_: alter.score_
        }))
      }
    })
  })
}

export function when<A, B>(cond : Schema<A, any>, consequent : Schema<A, A>) : Schema_<A, A>
export function when<A, B>(cond : Schema<A, any>, consequent : Schema<A, B>, alternative : Schema<A, B>) : Schema_<A, B>
export function when<A, B>(cond : Schema<A, any>, consequent : Schema<A, B>, alternative : Schema<A, B> = id<any>()) : Schema_<A, B> {
  return mkSchema(
    whenP(cond.parse_, consequent.parse_, alternative.parse_),
    whenP(cond.unparse_, consequent.unparse_, alternative.unparse_)
  )
}
