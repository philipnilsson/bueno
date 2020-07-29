import { Action } from './action'
import { CNF } from './logic'
import { Err, Message } from 'bueno/locale'

export type ParseResult<B> = {
  // cnf_ / res_ are "thunks" (i.e. zero-argument functions) in 
  // order to allow for sufficient laziness when using 
  // combinators like `fix` to create recursive schemas.
  cnf_ : () => Action<CNF<Err>>,
  res_ : () => Action<B>,
  // Rather than using a boolean to indicate success / failure,
  // validators return a score that must lie between 0 and 1 (1 is
  // perfect, 0 is complete failure) to indicate how well a parse
  // succeeded. This allows us to choose better return values in
  // ambiguous situations (for example when both validators match in
  // an `either )
  score_ : number
}

export interface Parser<A, B> {
  // This method runs the validation on its input...
  run_ : (a : A, inverted : boolean) => Action<ParseResult<B>>
}

export interface Parser_<A, B> extends Parser<A, B> {
  // ...we also allow validators to be "chained" using the call
  // signature (entirely for syntactic convenience).
  (...vs : Parser_<B, B>[]) : Parser_<A, B>
}

export interface Schema<A, B = A> {
  parse_ : Parser_<A, B>
  unparse_ : Parser_<B, A>
}

export interface Schema_<A, B = A> extends Schema<A, B> {
  (...ss : Schema<B, B>[]) : Schema_<A, B>
}

export type SchemaFactory<A, B> = (a : A) => Action<{
  parse?: { ok : boolean, msg : Message },
  validate?: { ok : boolean, msg : Message },
  result?: B,
  score?: number
}>

export type UndefinedOptional<A> =
  { [P in keyof A]?: A[P] } &
  { [L in { [K in keyof A]: undefined extends A[K] ? never : K }[keyof A]]: A[L] }

export type ForgetfulValidator<A, B> =
  <C extends A>(...vs : Parser_<B, B>[]) => Parser_<C, C>

export type ForgetfulSchema<A, B> =
  (...vs : Schema<B, B>[]) => Schema_<A, A>

export type Messages = string | {
  [k in string]: Messages
}

export type Obj = Record<string, unknown>

