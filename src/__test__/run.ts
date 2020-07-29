import { enUS } from '../locales/en-US';
import { Parser, Schema } from '../types';
import { result } from '../schema/runners/result';
import { check } from '../schema/runners/check';
import { checkPerKey, Errors } from '../schema/runners/checkByKey';
import { all, chain, Action } from '../action';
import { sync } from '../schema/runners/sync';
import { flip } from '../schema/flip';
import { Locale } from '../index';

export async function run<A, B>(
  v : Parser<A, B>, a : unknown
) : Promise<[string[], B, number]> {
  const c =
    await v.run_(a as A, false);

  const cnf_
    = await c.cnf_();

  const res_ =
    await c.res_();

  const simplified =
    cnf_.filter(x => !x.some(y => y.ok));

  const build =
    simplified.map(disj => {
      const lang = enUS as Locale
      return enUS.builder.either(disj.map(x => x.m(lang.builder)));
    })

  const msg =
    build.map(x => enUS.renderer.render(x, []))

  return [msg, res_, c.score_];
}

export function parseAsync<A, B>(
  value : A,
  schema : Schema<A, B>,
  language : Locale,
) : Action<{
  result : B,
  error : string | null,
  errorsByKey : Errors<B>
}> {
  const results = chain(all([
    result(value, schema),
    check(value, schema, language),
    checkPerKey(value, schema, language),
  ]) as any,
    (kvs : [B, string | null, Errors<B>]) => ({
      result: kvs[0],
      error: kvs[1],
      errorsByKey: kvs[2]
    })
  )
  return results
}

export const parse =
  sync(parseAsync)

export const unparse =
  sync(<A, B>(v : B, s : Schema<A, B>, l : Locale) => parseAsync(v, flip(s), l))
