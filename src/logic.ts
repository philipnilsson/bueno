import { isEmpty } from "./utils"

export type CNF<A> = A[][]

export function mapCNF<A, B>(f : (a : A) => B) {
  return function(cnf_ : CNF<A>) : CNF<B> {
    return cnf_.map(disj => disj.map(f))
  }
}

export const _true : CNF<any> = []
export const _false : CNF<any> = [[]]

export function and<A>(x : CNF<A>, y : CNF<A>) {
  const result = x.concat(y)
  if (result.some(isEmpty)) {
    return _false
  }
  return result
}

export function or<A>(x : CNF<A>, y : CNF<A>) : CNF<A> {
  const result : CNF<A> = []
  x.forEach(a => {
    y.forEach(b => {
      result.push(a.concat(b))
    })
  })
  return result
}

export function not<A>(x : CNF<A>, negate : (a : A) => A) : CNF<A> {
  if (isEmpty(x)) {
    return _false
  }

  const cs =
    not(x.slice(1), negate)

  const result : CNF<A> = []
  x[0].forEach(a => {
    result.push(...cs.map(c => [negate(a)].concat(c)))
  })
  return result
}
