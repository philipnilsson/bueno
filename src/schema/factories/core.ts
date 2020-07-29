import { ParseResult, Parser_, Schema_, Schema, Parser, SchemaFactory } from '../../types'
import { Action, chain, pairA } from '../../action'
import { memo2 } from '../../memo'
import { _true, CNF, and, or } from '../../logic'
import { irreversible } from '../irreversible'
import { Err, Message } from 'bueno/locale'
import { isObject, constant, isEmpty, getParse, getUnparse, keys, toMessage } from '../../utils'

export function notP<A, B>(
  v : Parser<A, B>
) : Parser_<A, B> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return v.run_(a, !inv)
  })
}

export function eitherP<A, B, C, D>(
  v : Parser<A, C>,
  w : Parser<B, D>
) : Parser_<A | B, C | D> {
  return mkParserCallable(function(a : A | B, inv : boolean) {
    if (inv) {
      return bothP(notP(v), notP(w)).run_(a as any, false)
    }
    return pairA(v.run_(a as A, false), w.run_(a as B, false), (c, d) => {
      const res_ : () => Action<C | D> =
        c.score_ >= d.score_ ? c.res_ : d.res_
      let cnf_;
      if (c.score_ === 0 && d.score_ > 0.5) {
        cnf_ = d.cnf_
      }
      else if (d.score_ === 0 && c.score_ > 0.5) {
        cnf_ = c.cnf_
      } else {
        cnf_ = () => pairA(c.cnf_(), d.cnf_(), or)
      }
      return {
        cnf_,
        res_,
        score_: Math.max(c.score_, d.score_)
      }
    })
  })
}

export function either<A, B, C, D>(
  v : Schema<A, C>,
  w : Schema<B, D>
) : Schema_<A | B, C | D> {
  return mkSchema(
    eitherP(v.parse_, w.parse_),
    eitherP(v.unparse_, w.unparse_)
  )
}

export function merge<A, B>(a : A, b : B) : A & B {
  if (isObject(a) && isObject(b)) {
    return { ...a, ...b }
  }
  return a as A & B
}

export function bothP<A, B, C, D>(
  v : Parser<A, C>,
  w : Parser<B, D>
) : Parser_<A & B, C & D> {
  return mkParserCallable(function(a : A & B, inv : boolean) {
    if (inv) {
      return eitherP(notP(v), notP(w)).run_(a, false) as any
    }
    return pairA(v.run_(a, false), w.run_(a, false), (c, d) => ({
      cnf_: () => pairA(c.cnf_(), d.cnf_(), and),
      res_: () => pairA(c.res_(), d.res_(), (rc, rd) => c.score_ >= d.score_
        ? merge(rc, rd)
        : merge(rd, rc)
      ),
      score_: (c.score_ + d.score_) / 2
    }))
  })
}

export function both<A, B, C, D>(
  v : Schema<A, C>,
  w : Schema<B, D>,
) : Schema_<A & B, C & D> {
  return mkSchema(
    bothP(v.parse_, w.parse_),
    bothP(v.unparse_, w.unparse_)
  )
}

export function pipeP<A, B, C>(
  v : Parser<A, B>,
  w : Parser<B, C>
) : Parser_<A, C> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(v.run_(a, inv), c => {
      if (c.score_ < 1) {
        return {
          cnf_: c.cnf_,
          res_: () => chain(c.res_(), rc => chain(w.run_(rc, inv), d => d.res_())),
          score_: c.score_,
        } as ParseResult<C>
      }
      return chain(c.res_(), rc => {
        return chain(w.run_(rc, inv), d => {
          return {
            res_: d.res_,
            cnf_: () => chain(d.cnf_(), cnf_ => cnf_.length ? cnf_ : c.cnf_()),
            score_: (d.score_ + 1) / 2,
          }
        })
      })
    })
  })
}

export function pipe<A, B, C>(
  s : Schema<A, B>,
  t : Schema<B, C>
) : Schema_<A, C> {
  return mkSchema(
    pipeP(s.parse_, t.parse_),
    pipeP(t.unparse_, s.unparse_)
  )
}

export const anyP : Parser_<any, any> =
  mkParser_(constant({}))

export const any =
  mkSchema(anyP, anyP)

export const id : <A = any>() => Schema_<A, A> =
  constant(mkSchema(anyP as any, anyP as any))

export function everyP<A, B>(
  vs : Parser<A, B>[]
) : Parser_<A, B> {
  if (isEmpty(vs)) return anyP
  return (vs as any).reduce(bothP)
}

export function every<A, B>(
  ...vs : Schema<A, B>[]
) : Schema_<A, B> {
  return mkSchema(
    everyP(vs.map(getParse)),
    everyP(vs.map(getUnparse))
  )
}

export function forgetP<A, B>(v : Parser<A, B>) : Parser_<A, A> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(v.run_(a, inv), r => {
      return {
        cnf_: r.cnf_,
        res_: constant(a),
        score_: r.score_
      }
    })
  })
}

export function forget<A, B>(
  schema : Schema_<A, B>
) : Schema_<A, A> {
  return mkSchema(
    forgetP(schema.parse_),
    id().parse_
  )
}

export function mkSchema<A, B>(
  parse : Parser_<A, B>,
  unparse : Parser_<B, A> = mkParserCallable(irreversible('mkSchema'))
) : Schema_<A, B> {
  function call(...ss : Schema<B, B>[]) : Schema_<A, B> {
    const nested = every(...ss)
    return mkSchema(
      pipeP(parse, forgetP(nested.parse_)),
      pipeP(forgetP(nested.unparse_), unparse)
    )
  }
  call.parse_ = parse
  call.unparse_ = unparse
  return call
}

export function mkParserCallable<A, B>(
  fn : (a : A, inverted : boolean) => Action<ParseResult<B>>
) : Parser_<A, B> {
  function call(...vs : Parser_<B, B>[]) : Parser_<A, B> {
    return pipeP(call, forgetP(everyP(vs)))
  }
  call.run_ = memo2(fn)
  return call
}

export function mkParser<A, B>(
  check : SchemaFactory<A, B>
) : Parser_<A, B> {
  return mkParser_((a : A) => {
    return chain(check(a), result => {
      return ({
        parse_: result.parse,
        validate_: result.validate,
        score_: result.score,
        result_: result.result,
      })
    })
  })
}

export type InternalParserFactory<A, B> = (a : A) => Action<{
  parse_?: { ok : boolean, msg : string | Message },
  validate_?: { ok : boolean, msg : string | Message },
  result_?: B,
  score_?: number
}>

export function mkParser_<A, B>(
  check : InternalParserFactory<A, B>
) : Parser_<A, B> {
  return mkParserCallable(function(a : A, inv : boolean) {
    return chain(check(a), args => {
      const { parse_, validate_, result_, score_ } = args
      if (IS_DEV) {
        const { parse_, validate_, result_, score_, ...rest } = args
        const extras = keys(rest)
        if (extras.length) {
          throw new Error(`Unknown argument(s) ${extras.join(', ')}`)
        }
      }
      let msg : CNF<Err> = _true
      let points = 1
      if (parse_) {
        const good = parse_.ok
        if (!good) {
          points = 0
        }
        msg = [[{ k: 'p', m: toMessage(parse_.msg), ok: good }]]
      }
      if (validate_) {
        const good = validate_.ok !== inv
        const validationScore = score_ ?? (good ? 1 : 0)
        if (parse_) {
          points = (points + validationScore) / 2
        } else {
          points = validationScore
        }
        if (!parse_ || parse_.ok) {
          msg = and(
            msg,
            [[{
              k: 'v',
              m: l => inv
                ? l.not(toMessage(validate_.msg)(l))
                : toMessage(validate_.msg)(l),
              ok: good
            }]]
          )
        }
      }
      return {
        cnf_: constant(msg),
        res_: constant(('result_' in args ? result_ : a) as B),
        score_: points
      }
    })
  })
}
