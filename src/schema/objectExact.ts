import { mapValues, isObject, getUnparse, getParse, keys } from "../utils"
import { Parser_, UndefinedOptional, Schema, Schema_, Parser, Obj } from "../types"
import { objectP } from "./object"
import { mkParserCallable } from "./factories/core"
import { mkSchema } from "./factories/mkSchema"
import { and } from "../logic"
import { chain as chainA } from '../action'

export function objectExactP<BS>(
  vs : { [Key in keyof BS]: Parser<any, BS[Key]> }
) : Parser_<Obj, UndefinedOptional<BS>> {
  const v = objectP(vs)
  const ks = keys(vs)
  return mkParserCallable(function(a : Obj, inv : boolean) {
    return chainA(v.run_(a, inv), c => {
      if (isObject(a)) {
        const extraKeys = keys(a as any).filter(x => !ks.some(y => y === x))
        const score = ks.length / (ks.length + extraKeys.length)
        return {
          cnf_: () => chainA(c.cnf_(), e => {
            if (extraKeys.length) {
              return and(e, [[{
                k: 'p',
                m: l => l.keys(extraKeys),
                ok: false
              }]])
            }
            return e
          }),
          res_: c.res_,
          score_: (c.score_ + score) / 2
        }
      }
      return c
    })
  })
}

export function objectExact<AS, BS>(
  vs :
    { [Key in keyof AS]: Schema<AS[Key], any> } &
    { [Key in keyof BS]: Schema<any, BS[Key]> }
) : Schema_<UndefinedOptional<AS>, UndefinedOptional<BS>> {
  return mkSchema(
    objectExactP(mapValues(vs, getParse)) as any,
    objectExactP(mapValues(vs, getUnparse)) as any
  )
}


