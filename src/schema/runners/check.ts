import { Schema } from '../../types'
import { Action, chain } from '../../action'
import { ir } from './cnf'
import { Locale } from '../../index'
import { sync } from './sync'

export function checkAsync<A>(
  value : A,
  schema : Schema<A, any>,
  locale : Locale
) : Action<string | null> {
  return chain(ir(value, schema, locale), msgs => {
    return msgs[0]
      ? locale.renderer.render(msgs[0], [])
      : null
  })
}

export const check = sync(checkAsync)
