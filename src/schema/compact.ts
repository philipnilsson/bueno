import { mkParser_, pipeP, mkSchema } from "./factories/core";
import { UndefinedOptional, Parser, Parser_, Schema_, Schema, Obj } from "../types";
import { fromEntries, entries } from "../utils";

export function _compact<A extends Obj>(a : A) : UndefinedOptional<A> {
  return fromEntries(
    entries(a).filter(kv => kv[1] !== undefined)
  ) as any
}

const compactParser =
  mkParser_((a : Obj) => ({ result_: _compact(a) }))

export function compactP<A extends Obj, B extends Obj>(
  p : Parser<A, B>
) : Parser_<UndefinedOptional<A>, UndefinedOptional<B>> {
  return pipeP(p, compactParser) as any
}

export function compact<A extends Obj, B extends Obj>(
  p : Schema<A, B>
) : Schema_<UndefinedOptional<A>, UndefinedOptional<B>> {
  return mkSchema(
    compactP(p.parse_),
    compactP(p.unparse_)
  )
}
