import { chain as chainA } from '../action'
import { notP } from './not'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'
import { Parser, Schema_, Schema, Parser_, UndefinedOptional, Obj } from '../types'
import { Err, } from 'bueno/locale'
import { mapValues, isObject, getParse, getUnparse, keys } from '../utils'
import { mkParserCallable, everyP } from './factories/core'
import { pipeP } from './pipe'

export const anObject = mkParser_<Obj, Obj>(o => ({
  parse_: { ok: isObject(o), msg: l => l.object },
  result_: (isObject(o) ? o : {}) as Obj,
}))

function atKey<A, B, K extends string>(
  key : K,
  v : Parser<A, B>
) : Parser_<{ [k in K]: A }, { [k in K]: B }> {
  return mkParserCallable(function(a : { [k in K]: A }, inv : boolean) {
    return chainA(v.run_((a || {})[key], inv), c => {
      return {
        cnf_: () => chainA(c.cnf_(), ec => ec.map(c => c.map(
          d => ({
            k: d.k,
            m: l => l.at(key as string, d.m(l)),
            ok: d.ok
          }) as Err
        ))),
        res_: () => chainA(c.res_(), rc => ({ [key]: rc })) as { [k in K]: B },
        score_: c.score_
      }
    })
  })
}

export function objectP<BS>(
  vs : { [Key in keyof BS]: Parser<any, BS[Key]> }
) : Parser_<Obj, UndefinedOptional<BS>> {
  const ks =
    keys(vs) as (keyof BS)[]

  const byKey =
    ks.map((key : keyof BS) => atKey(key as string, vs[key]))

  const vpos : Parser_<Obj, UndefinedOptional<BS>> =
    pipeP(anObject, everyP(byKey) as any)

  const vneg : Parser_<Obj, UndefinedOptional<BS>> =
    pipeP(anObject, everyP(byKey.map(notP)) as any)

  return mkParserCallable(function(a : Obj, inv : boolean) {
    return (inv ? vneg : vpos).run_(a, false)
  })
}

objectP.run_ = anObject.run_

export function object<AS, BS>(
  vs :
    { [Key in keyof AS]: Schema<AS[Key], any> } &
    { [Key in keyof BS]: Schema<any, BS[Key]> }
) : Schema_<AS, BS> {
  return mkSchema(
    objectP(mapValues(vs, getParse)) as any,
    objectP(mapValues(vs, getUnparse)) as any
  )
}

object.parse_ = anObject
object.unparse_ = anObject


