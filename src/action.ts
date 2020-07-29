import { isPromise } from "./utils"

export type Action<A> =
  Promise<A> | A

export function chain<A, B>(
  a : A | Promise<A>,
  f : (a : A) => B | Promise<B>
) : B | Promise<B> {
  if (isPromise(a)) {
    return (a as Promise<A>).then(f)
  }
  return f(a as A)
}

export function all<A>(
  as : (A | Promise<A>)[]
) : A[] | Promise<A[]> {
  if (!as.some(isPromise)) {
    return as as any
  }
  return Promise.all(as)
}

export function pairA<A, B, C>(
  a : Action<A>,
  b : Action<B>,
  f : (a : A, b : B) => Action<C>
) : Action<C> {
  return chain(all([a, b]), (kv) => f(kv[0] as any, kv[1] as any))
}

export function toPromise<A>(
  a : Action<A>
) : Promise<A> {
  return (isPromise(a) ? a : Promise.resolve(a)) as any
}
