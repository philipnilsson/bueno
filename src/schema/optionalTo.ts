import { swap } from './swap'
import { Schema } from '../types'

export function optionalTo<A>(to : A) : Schema<null | undefined | A, A> {
  return swap([[null, to], [undefined, to]])
}
