declare global {
  const IS_DEV : boolean
}

export { any } from './schema/any'
export { apply } from './schema/apply'
export { alphaNumeric } from './schema/alphaNumeric'
export { array } from './schema/array'
export { atLeast } from './schema/atLeast'
export { atMost } from './schema/atMost'
export { between } from './schema/between'
export { boolean } from './schema/boolean'
export { both } from './schema/both'
export { compact } from './schema/compact'
export { chain } from './schema/chain'
export { date } from './schema/date'
export { defaultTo } from './schema/defaultTo'
export { describePaths } from './path'
export { either } from './schema/either'
export { email } from './schema/email'
export { emptyString } from './schema/emptyString'
export { even } from './schema/even'
export { every } from './schema/every'
export { exactly } from './schema/exactly'
export { fix } from './schema/fix'
export { flip } from './schema/flip'
export { forget } from './schema/forget'
export { id } from './schema/id'
export { integer } from './schema/integer'
export { invalidDate } from './schema/date';
export { irreversible } from './schema/irreversible'
export { length } from './schema/length'
export { lessThan } from './schema/lessThan'
export { lift } from './schema/lift'
export { match } from './schema/match'
export { moreThan } from './schema/moreThan'
export { not } from './schema/not'
export { number } from './schema/number'
export { object } from './schema/object'
export { objectExact } from './schema/objectExact'
export { objectInexact } from './schema/objectInexact'
export { odd } from './schema/odd'
export { oneOf } from './schema/oneOf'
export { optional } from './schema/optional'
export { optionalTo } from './schema/optionalTo'
export { pair } from './schema/pair'
export { path } from './schema/path'
export { pipe } from './schema/pipe'
export { pure } from './schema/pure'
export { self } from './schema/self'
export { size } from './schema/size'
export { some } from './schema/some'
export { string } from './schema/string'
export { sum } from './schema/sum'
export { toDate } from './schema/toDate'
export { toJSON } from './schema/toJSON'
export { toNumber } from './schema/toNumber'
export { toString } from './schema/toString'
export { toURL } from './schema/toURL'
export { unknown } from './schema/unknown'
export { updateMessage } from './schema/updateMessage'
export { setMessage } from './schema/setMessage'
export { swap } from './schema/swap'
export { updateNestedMessages } from './schema/updateNestedMessages'
export { when } from './schema/when'

export { iterable } from './schema/collections/iterable'
export { map } from './schema/collections/map'
export { set } from './schema/collections/set'
export { toArray } from './schema/collections/toArray'
export { toMap } from './schema/collections/toMap'
export { toMapFromObject } from './schema/collections/toMapFromObject'
export { toSet } from './schema/collections/toSet'

// Factories
export { createSchema } from './schema/factories/createSchema'
export { mkSchema } from './schema/factories/mkSchema'
export { mkParser } from './schema/factories/mkParser'
export { mkParserCallable } from './schema/factories/core'
export { mkParserHaving } from './schema/factories/mkParserHaving'
export { mkSchemaHaving } from './schema/factories/mkSchemaHaving'

// Runners
export { result, resultAsync } from './schema/runners/result';
export { check, checkAsync } from './schema/runners/check';
export { checkPerKey, checkPerKeyAsync } from './schema/runners/checkByKey';

// Locales
export { enUS, enUSOptions, English } from './locales/en-US'
export { svSE, Swedish } from './locales/sv-SE'
export { deDE, German } from './locales/de-DE'
export { esES, Spanish } from './locales/es-ES'
export { emptyLocale } from './locales/emptyLocale'

export { mkRenderer, RenderingOptions } from './DefaultIR'

// Types
export {
  Schema,
  Parser,
  Schema_,
  Parser_,
  SchemaFactory,
  UndefinedOptional
} from './types'

import './Builtins'
import { Language } from 'bueno/locale'
import { MessageBuilder } from 'bueno/locale'

export type Locale = Language<any, any>

export type Builder = MessageBuilder<any>
