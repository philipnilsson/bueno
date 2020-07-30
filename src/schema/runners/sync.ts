import { Action } from '../../action'

export function sync<A, B extends any[]>(
  a : (...args : B) => Action<A>
) : (...args : B) => A {
  if (IS_DEV) {
    if (a instanceof Promise) {
      throw new Error('Using sync runner function on an async parser. Use its async version instead.')
    }
  }
  return a as any
}
