import { Schema_, Parser_, Parser } from "../types"
import { mkSchema } from "./factories/mkSchema"
import { mkParserCallable } from "./factories/core"

export function errFix() : any {
  throw new Error('Strict usage of `fix`')
}

export function fixP<A, B = A>(
  fn : (v : Parser<A, B>) => Parser<A, B>
) : Parser_<A, B> {
  let x : Parser<A, B> = mkParserCallable(errFix)
  const check : Parser_<A, B> =
    mkParserCallable((a, inv) => x.run_(a, inv))
  x = fn(check)
  return mkParserCallable(x.run_)
}

export function fix<A, B = A>(
  fn : (v : Schema_<A, B>) => Schema_<A, B>
) : Schema_<A, B> {
  let x : Schema_<A, B> = mkSchema(
    mkParserCallable(errFix),
    mkParserCallable(errFix)
  )
  const check : Schema_<A, B> = mkSchema(
    mkParserCallable((a : A, inv : boolean) => x.parse_.run_(a, inv)),
    mkParserCallable((a : B, inv : boolean) => x.unparse_.run_(a, inv))
  )
  return x = fn(check)
}


