import { Message } from "bueno/locale"

export const id = <A>(x : A) => x

export const isDigits = (x : string) =>
  x.match(/\d+/) !== null

export function isEmpty<A>(a : A[]) : boolean {
  return !a.length
}

export function isString(a : any) : boolean {
  return typeof a === 'string'
}

export function isNumber(a : any) : boolean {
  return typeof a === 'number'
}

export function isPromise(a : any) : boolean {
  return a instanceof Promise
}

export function constant<A>(a : A) : () => A {
  return () => a
}

export function push<A>(a : A, as : A[]) : A[] {
  as.push(a)
  return as
}

export function entries<A extends symbol | string | number, B>(
  obj : { [key in A]: B },
) : [A, B][] {
  const result : [A, B][] = []
  for (const key in obj) {
    result.push([key, obj[key]] as [A, B])
  }
  return result
}

export function fromEntries<A extends symbol | string | number, B>(
  entries : [A, B][]
) : { [key in A]: B } {
  const result : { [key in A]: B } = {} as { [key in A]: B }
  entries.forEach(kv => {
    result[kv[0]] = kv[1]
  })
  return result
}

export function mapEntries<A, B, K extends string | number | symbol>(
  obj : { [key in K]: A },
  f : (key : K, val : A) => [K, B]
) : { [key in K]: B } {
  const result : { [key in K]: B } = {} as any
  for (const key in obj) {
    const kv = f(key, obj[key])
    result[kv[0]] = kv[1]
  }
  return result
}

export function isIterable(a : any) : a is Iterable<any> {
  return !!a && typeof a[Symbol.iterator] === 'function'
}

export function average(scores : number[]) : number {
  if (isEmpty(scores)) {
    return 1
  }
  return scores.reduce((x, y) => x + y, 0) / scores.length
}

export function mapValues<KS extends string, A, B>(
  x : { [key in KS]: A },
  f : (a : A) => B
) : { [key in KS]: B } {
  return mapEntries(x, (k, v) => [k, f(v as any)]) as any
}

export function assignPath<A>(obj : any, path : string[], val : A) {
  if (isEmpty(path)) return obj
  if (path.length === 1) {
    if (isObject(obj[path[0]])) {
      obj[path[0]][''] = val
    } else {
      obj[path[0]] = val
    }
  }
  if (path.length > 1) {
    if (obj[path[0]] === void 0) {
      obj[path[0]] = {}
    }
    if (isString(obj[path[0]])) {
      obj[path[0]] = { '': obj[path[0]] }
    }
    assignPath(obj[path[0]], path.slice(1), val)
  }
  return obj
}

export function joinWithCommas(
  as : string[],
  separator : string
) : string {
  if (isEmpty(as)) {
    return ''
  }
  if (as.length < 2) {
    return as[0]
  }
  const copy = [...as]
  return copy.splice(0, as.length - 1).join(', ')
    + ' '
    + separator
    + ' '
    + copy[0]
}

export function capFirst(s : string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function isObject(obj : any) {
  return obj !== null && typeof obj === 'object'
}

export const isArray =
  Array.isArray

export const keys =
  Object.keys

type TUnionToIntersection<U> = (
  U extends any ? (k : U) => void : never
) extends (k : infer I) => void
  ? I
  : never

export function deepMerge<T extends { [key : string] : any }[]>(
  objects : T
) : TUnionToIntersection<T[number]> {
  return objects.reduce((result, current) => {
    keys(current).forEach((key) => {
      if (isArray(result[key]) && isArray(current[key])) {
        result[key] = result[key].concat(current[key])
      } else if (isObject(result[key]) && isObject(current[key])) {
        result[key] = deepMerge([result[key], current[key]])
      } else {
        result[key] = current[key]
      }
    })
    return result
  }, {}) as any
}

export function words(args : string[]) {
  return args.filter(Boolean).join(' ')
}

export function byEmpty(x : string, y : string) : number {
  if (x === '') return -1
  if (y === '') return 1
  return 0
}

export function getParse(x : { parse_ : any }) {
  return x.parse_
}

export function getUnparse(x : { unparse_ : any }) {
  return x.unparse_
}

export function toMessage(s : string | Message) : Message {
  return isString(s) ? (l => l.fromString(s as string)) : (s as Message)
}

export function compose<A, B, C>(f : (a : A) => B, g : (b : B) => C) : (a : A) => C {
  return x => g(f(x))
}
