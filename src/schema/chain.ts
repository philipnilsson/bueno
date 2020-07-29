import { self, selfP } from "./self"
import { Parser, Parser_, Schema, Schema_ } from "../types"
import { pipe, pipeP } from "./pipe"
import { irreversible } from "./irreversible"

export function chainP<A, B, C>(
  v : Parser<A, B>,
  f : (b : B) => Parser<B, C>
) : Parser_<A, C> {
  return pipeP(v, selfP(f))
}

export function chain<A, B, C>(
  v : Schema<A, B>,
  f : (b : B) => Schema<B, C>,
  g : (c : C) => Schema<B, C> = irreversible('chain'),
) : Schema_<A, C> {
  return pipe(v, self(f, g))
}
