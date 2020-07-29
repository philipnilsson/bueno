import { Schema } from '../../types'
import { Action, chain } from '../../action'
import { CNF } from '../../logic'
import { Err } from 'bueno/locale'
import { Locale } from '../../index'
import { sync } from './sync'

export function cnfAsync<A>(
  value : A,
  schema : Schema<A, any>
) : Action<CNF<Err>> {
  const result = schema.parse_.run_(value, false)
  return chain(result, r => r.cnf_())
}

export const cnf = sync(cnfAsync)

export function ir<A, IR>(
  value : A,
  schema : Schema<A, any>,
  language : Locale
) : Action<IR[]> {
  return chain(cnfAsync(value, schema), cnf => {
    return cnf
      .filter(x => !x.some(y => y.ok))
      .map(disj => language.builder.either(disj.map(x => x.m(language.builder))))
  })
}
