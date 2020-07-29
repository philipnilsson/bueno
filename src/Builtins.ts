import { not, CNF } from './logic'
import { Message, Err } from 'bueno/locale'

export function message(x : Message) {
  return x
}

export function mapError(f : (m : Message) => Message) : (err : Err) => Err {
  return err => ({
    k: err.k,
    ok: err.ok,
    m: f(err.m)
  })
}

export const negate = (c : CNF<Err>) : CNF<Err> => not(c, (e : Err) => ({
  k: e.k,
  ok: !e.ok,
  m: l => l.not(e.m(l))
}))

declare module 'bueno/locale' {
  export interface MessageBuilder<IR> {
    mustBe(r : string | IR) : IR;
    mustHave(r : string | IR) : IR;
    has(name : string) : (ir : IR) => IR;

    length(r : IR) : IR;
    sum(r : IR) : IR;
    more<A>(lb : A) : IR;
    less<A>(ub : A) : IR;
    between<A>(lb : A, ub : A) : IR;
    atMost<A>(ub : A) : IR;
    atLeast<A>(lb : A) : IR;

    oneOf<A>(n : A[]) : IR;
    exactly<A>(n : A) : IR;
    keys(keys : string[]) : IR;
    number : IR;
    integer : IR;
    string : IR;
    email : IR;
    alphanum : IR,
    url : IR;
    object : IR;
    leftOut : IR;
    json : IR;
    uuid : IR;
    iterable : IR;
    bool : IR;
    array : IR;
    set : IR;
    map : IR;
    date : IR;
    even : IR;
    odd : IR;
    empty : IR;
  }
}

