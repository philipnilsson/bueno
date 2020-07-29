import { Schema, Obj } from '../../types'
import { Locale } from '../../index'
import { chain, Action } from '../../action';
import { ir } from './cnf';
import { deepMerge } from '../../utils';
import { sync } from './sync';

export declare type Errors<Values> =
  { [K in keyof Values]?: Values[K] extends any[] ? Values[K][number] extends Obj ? Errors<Values[K][number]>[] | string | string[] : string | string[] : Values[K] extends Obj ? Errors<Values[K]> : string; };

export function checkPerKeyAsync<A, B>(
  value : A,
  schema : Schema<A, B>,
  locale : Locale
) : Action<Errors<B>> {
  return chain(ir(value, schema, locale), msgs => {
    return deepMerge(
      msgs.map(msg => locale.renderer.byKey(msg, [])).reverse()
    )
  })
}

export const checkPerKey = sync(checkPerKeyAsync)
