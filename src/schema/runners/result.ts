import { Schema } from "../../types"
import { chain, Action } from "../../action"
import { sync } from './sync'

export function resultAsync<A, B>(
  value : A,
  schema : Schema<A, B>
) : Action<B> {
  return chain(schema.parse_.run_(value, false), r => r.res_())
}

export const result = sync(resultAsync)
