import { Parser_, Schema_ } from '../types'
import { mkSchema } from './factories/mkSchema'
import { mkParser_ } from './factories/mkParser'

export const exactlyP = <A>(
  target : A,
  equals : (x : A, y : A) => boolean = (x, y) => x === y
) : Parser_<A, A> => {
  return mkParser_(a => {
    const ok = equals(a as A, target)
    return {
      validate_: {
        ok,
        msg: l => l.exactly(target)
      },
      result_: typeof a === typeof target ? a as A : target
    }
  })
}

export const exactly = <A>(
  target : A,
  equals : (x : A, y : A) => boolean = (x, y) => x === y
) : Schema_<A, A> => {
  return mkSchema(
    exactlyP(target, equals),
    exactlyP(target, equals)
  )
}


