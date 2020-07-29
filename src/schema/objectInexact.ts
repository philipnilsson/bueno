import { Parser, Parser_, UndefinedOptional, Schema, Schema_, Obj } from "../types"
import { objectP } from "./object"
import { mkParserCallable } from "./factories/core"
import { mkSchema } from "./factories/mkSchema"
import { mapValues, isObject, getUnparse, getParse } from "../utils"
import { chain as chainA } from '../action'

export function objectInexactP<BS>(
  vs : { [Key in keyof BS]: Parser<any, BS[Key]> }
) :
  Parser_<Obj, UndefinedOptional<BS>> {
  const v = objectP(vs)
  return mkParserCallable(function(a : Obj, inv : boolean) {
    return chainA(v.run_(a, inv), c => ({
      cnf_: c.cnf_,
      res_: () => isObject(a)
        ? chainA(c.res_(), rc => ({ ...a, ...rc } as any))
        : c.res_,
      score_: c.score_
    }))
  })
}

export function objectInexact<AS, BS>(
  vs :
    { [Key in keyof AS]: Schema<AS[Key], any> } &
    { [Key in keyof BS]: Schema<any, BS[Key]> }
) : Schema_<UndefinedOptional<AS> & { [k in string]: any }, UndefinedOptional<BS> & { [k in string]: any }> {
  return mkSchema(
    objectInexactP(mapValues(vs, getParse)) as any,
    objectInexactP(mapValues(vs, getUnparse)) as any
  )
}

