<br />
<img src="./src/docs/logo.png" width="300px" />
<br />

A tiny, composable validation library for forms, APIs & more. You'll like if if you need something

<p> 🌳 Small & <a href="https://webpack.js.org/guides/tree-shaking/">tree-shakeable</a>.  </p> <p> 💡 Expressive! Use full
boolean logic to compose your schemas </p> <p> 💫 Bidirectional. <a
href="./src/docs/bidirectional.md">Learn more</a> </p> <p> 🚀 Awesome
error messages in multiple languages supported out of the box, with
more on the way.  <a href="./src/docs/languages.md">Learn more</a>
</p> <p> ⏱ Asynchronous (when needed!)  </p>

# Installation

Install using `npm install --save bueno` or `yarn add bueno`.

Check out the quickstart section below, or go directly to the <a href="#api-documentation">API docs</a>

<ul>
  <li><a href="./src/docs/express.md">Usage example with <code>express</code></a></li>
  <li><a href="./src/docs/formik.md">Usage example with <code>react</code> + <code>formik</code></a></li>
  <li><a href="./src/docs/customizing-errors.md">Customzing error messages</a></li>
</ul>

# Quickstart

`bueno` allows you to quickly and predictably compose validation
schemas. Here's how it looks in action:

```typescript
import { alphaNumeric, atLeast, check, either, email, enUS, length, moreThan, number, optional, string, svSE } from 'bueno'

const username = 
  string(length(atLeast(8)), alphaNumeric)

const age = 
  number(atLeast(18), not(moreThan(130))

const user = object({
  id: either(email, username),
  age: optional(age)
})

const input = {
  id: 'philip@example.com', 
  age: 17 
}

check(input, user, enUS)
// 'Age must be at least 18 or left out'

checkPerKey(input, user, describePath(svSE, { age: 'ålder' }))
// { age: 'Ålder måste vara som minst 18 eller utlämnad' }
```

# API documentation

## Core 

Schemas are constructed using <a href="#basic-schemas">basic
schemas</a> like `number` `string`, `atLeast(10)`, `exactly(null)` and
by using <a href="#combinator-api">combinators</a> like `either`,
`object`, `array`, `fix` to create more complex schemas.

Most schemas (specifically `Schema_`:s) can be called as
functions with other schemas as arguments. E.g. 

```typescript
number(even, atLeast(10))
```

The semantics are a schema returning the value of `number` with the
additional validations from `even` and `atLeast(10)` taking place.

## Running a schema

[check](#check) &bull; [checkPerKey](#check) &bull; [result](#check)

<hr/>

The following functions allow you to feed input into a schema to parse
& validate it. Note that schema evaluation is cached, so calling e.g.
`check(input)` then immediately `result(input)` is not inefficient.

### `check`

```java
checkAsync :: <A>(value : A, schema : Schema<A, any>, locale : Locale) : string | null
```

Returns a `string` with a validation error constructed using the given
locale, or `null` if validation succeeded.

```typescript
check('123', number, enUS)
// 'Must be a number'
```

### `checkByKey`

Returns an object of errors for each key in an object (for a schema
constructed using the [`object`](#object) combinator)

```typescript
checkByKey({ n: '123', b: true }, object({ n: number, b: boolean }, enUS)
// { n: 'Must be a number', b: 'Must be a boolean' }
```

### `result`

Returns the result of parsing using a schema.

```typescript
result({ n: '123', d: 'null' }, object({ n: toNumber, d: toJSON })
// { n: 123, d: null }
```

### `checkAsync`, `checkByKeyAsync` and `resultAsync`

The async versions of `check`, `checkByKey` and `result` respectively.

## Combinator API

<a href="#apply">apply</a> &bull;
<a href="#both">both</a> &bull;
<a href="#compact">compact</a> &bull;
<a href="#defaultto">defaultTo</a> &bull;
<a href="#either">either</a> &bull;
<a href="#every">every</a> &bull;
<a href="#fix">fix</a> &bull;
<a href="#flip">flip</a> &bull;
<a href="#not">not</a> &bull;
<a href="#object">object</a> &bull;
<a href="#optional">optional</a> &bull;
<a href="#pipe">pipe</a> &bull;
<a href="#self">self</a> &bull;
<a href="#setmessage">setMessage</a> &bull;
<a href="#some">some</a> &bull;
<a href="#when">when</a>

Combinators create new, more complex schemas out of existing, simpler schemas.

### `both`

Creates a schema that satisfies both of its arguments.

```java
both :: <A, B, C, D>(v : Schema<A, C>, w : Schema<B, D>,) => Schema_<A & B, C & D>
```

```typescript
const schema =
  both(even, atLeast(10))

check(schema, 11, enUS)
// 'Must be even.'

check(schema,  8, enUS)
// 'Must be at least 10.'

check(schema,  12, enUS)
// null
```

You may prefer using the <a href="#core">call signatures</a>
of schemas over using this combinator.

### `either`

Creates a schema that satisfies either of its arguments.

```java
either :: <A, B, C, D>(v : Schema<A, C>, w : Schema<B, D>,) => Schema_<A & B, C & D>
```

```typescript
const schema =
  either(even, atLeast(10))

check(schema, 11, enUS)
// null

check(schema,  8, enUS)
// null

check(schema,  9, enUS)
// 'Must be even or at least 10'
```

### `optional`

Make a schema also match `undefined`.

```java
optional :: <A>(v : Schema<A, B>) : Schema<A | undefined, B | undefined>
```

```typescript
const schema = optional(number)

check(schema,  9, enUS)
// null

check(schema, undefined, enUS)
// null

check(schema, null, enUS)
// 'Must be a number or left out
```


### `not`

```java
not :: <A, B>(v : Schema<A, B>) => Schema_<A, B>
```

Negates a schema. Note that negation only affect the "validation" and
not the "parsing" part of a schema. Essentially, remember that `not` does not affect
the type signature of a schema.

For example, `not(number)` is the same as just `number`. The reason is
that we can't really do much with a value that we know only to have
type "not a number".

```typescript
const schmea = 
  number(not(moreThan(100)))

check(103, schema, enUS)
// Must not be more than 100
```

### `object`

Create a schema on objects from an object of schemas.

```java
object :: <AS, BS>(vs : 
  { [Key in keyof AS]: Schema<AS[Key], any> } & 
  { [Key in keyof BS]: Schema<any, BS[Key]> }
) => Schema_<AS, BS>
```

```typescript
const schema = object({ 
  age: number, 
  name: string 
})

check({ age: 13 }, schema, enUS)
// Name must be a string

check({ age: '30', name: 'Philip' }, schema, enUS)
// Age must be a number

check({ age: 30, name: 'Philip' }, schema, enUS)
// null
```

You can use [`compact`](#compact) to make undefined keys optional. 

`inexactObject` and `exactObject` are versions of this that are more
lenient / strict w.r.t keys not mentioned in the schema.

### `compact`

Remove keys in an object that are `undefined`.

```java
compact :: <A, B>(p : Schema<A, B>) : Schema_<UndefinedOptional<A>, UndefinedOptional<B>> {
```

```typescript
const schema =
  compact(object({ n: optional(number) }))

result({ n: undefined }, schema)
// {}
```

### `fix`

Create a schema that can recursively be defined in terms
itself. Useful for e.g. creating a schema that matches a binary tree
or other recursive structures.

```java
fix :: <A, B = A>(fn : (v : Schema<A, B>) => Schema<A, B>) => Schema_<A, B>
```

TypeScript is not too great at inferring types using this combinators,
so typically help it using an annotation as below

```typescript
type BinTree<A> = {
  left : BinTree<A> | null,
  right : BinTree<A> | null,
  value : A
}

const bintree = fix<BinTree<string>, BinTree<number>>(bintree => object({
  left: either(exactly(null), bintree),
  right: either(exactly(null), bintree),
  value: toNumber
}))
```

### `self`

Create a schema dynamically defined in terms of its input.

```typescript
type User = {
  verified : boolean,
  email : string | null
}

const schema = self<User, User>(user => {
  return object({
    verified: boolean,
    email: user.verified ? email : exactly(null)
  })
})
```

### `flip`

Reverse a schema

```java
flip :: <A, B>(schema : Schema<A, B>) => Schema_<B, A>
```

```typescript
const schema = reverse(toNumber)

result(123, schema)
// '123'
```

### `defaultTo`

Set a default value for a schema when it fails parsing.

```java
defaultTo :: <A, B>(b: B, schema : Schema<A, B>) => Schema_<B, A>
```

```typescript
const schema = 
  defaultTo(100, number)

result(null, schema)
// 100
```

### `pipe`

Pipe the output of a schema as the input into another

```java
pipe :: <A, B, C>(s : Schema<A, B>, t : Schema<B, C>) => Schema_<A, C>
```

```typescript
const schema = 
   pipe(toNumber, lift(x => x + 1))

result('123', schema)
// 124
```

### `apply`

Set the input of a schema to a fixed value. Can be used when creating
a schema where the definition of one key depends on another.

```java
apply :: <A>(v : Schema<A, A>, value : A, path : string) => Schema_<any, A>;
```

```typescript
type Schedule = {
  weekday : string
  price : number
}

const schema = self((schedule : Schedule) => object({
  weekday: oneOf('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
  price: when(
    // When schedule.weekday is Sat or Sun, the
    // price must be at least 100, otherwise at most 50.
    apply(oneOf('Sat', 'Sun'), schedule.weekday, 'weekday'), 
    atLeast(100),
    atMost(50)
  )
})
```

### `every`

A variable arguments version of `both`.

```java
every :: <A, B>(...vs : Schema<A, B>[]) => Schema_<A, B>
```

### `setMessage`

Set the error message of a parser.

```typescript
const thing = setMessage(
  object({ foo: string, bar: number }),
  l => l.noun('should be a thingy),
)

check({ foo: '' } as any, thing, enUS)
// 'Should be a thingy'
```

### `some`

A variable arguments version of `either`.

```java
some :: <A, B>(...vs : Schema<A, B>[]) => Schema_<A, B>
```

### `when`

"if-then-else" on parsers. 

```java
when :: <A, B>(cond : Schema<A, any>, consequent : Schema<A, B>, alternative : Schema<A, B>) => Schema_<A, B>
```

The "else" part is optional, in which case this combinator has the signature

```java
when :: <A, B>(cond : Schema<A, any>, consequent : Schema<A, A>) => Schema_<A, A>
```

```typescript
const schema =
  when(even, atLeast(10), atMost(20))
  
check(8, schema, enUS)
// 'Must be at least 10 when even'

check(21, schema, enUS)
// 'Must be at most 20 when not even'

check(11, schema, enUS)
// null
```
   
## Basic schemas

<a href="#alphanumeric">alphaNumeric</a> &bull;
<a href="#any">any</a> &bull;
<a href="#atleast">atLeast</a> &bull;
<a href="#atmost">atMost</a> &bull;
<a href="#between">between</a> &bull;
<a href="#boolean">boolean</a> &bull;
<a href="#date">date</a> &bull;
<a href="#email">email</a> &bull;
<a href="#emptystring">emptyString</a> &bull;
<a href="#even">even</a> &bull;
<a href="#exactly">exactly</a> &bull;
<a href="#id">id</a> &bull;
<a href="#integer">integer</a> &bull;
<a href="#length">length</a> &bull;
<a href="#lessthan">lessThan</a> &bull;
<a href="#lift">lift</a> &bull;
<a href="#match">match</a> &bull;
<a href="#morethan">moreThan</a> &bull;
<a href="#number">number</a> &bull;
<a href="#objectexact">objectExact</a> &bull;
<a href="#objectinexact">objectInexact</a> &bull;
<a href="#odd">odd</a> &bull;
<a href="#oneof">oneOf</a> &bull;
<a href="#optionalto">optionalTo</a> &bull;
<a href="#pair">pair</a> &bull;
<a href="#path">path</a> &bull;
<a href="#size">size</a> &bull;
<a href="#string">string</a> &bull;
<a href="#sum">sum</a> &bull;
<a href="#swap">swap</a> &bull;
<a href="#todate">toDate</a> &bull;
<a href="#tojson">toJSON</a> &bull;
<a href="#tonumber">toNumber</a> &bull;
<a href="#tostring">toString</a> &bull;
<a href="#tourl">toURL</a> &bull;
<a href="#unknown">unknown</a>

Basic schemas are simple schemas that can be composed into more
complex ones using the combinator API.

### `alphaNumeric`

```java
alphaNumeric :: Schema_<string, string>
```

Match an alphanumeric string.

```typescript
check('acb123', alphaNumeric, enUS)
// null

check('acb|123', alphaNumeric, enUS)
// Must have letters and numbers only
```

### `any`

```java
any :: Schema_<any, any>
```

Successfully matches any input.

```typescript
check(123, any, enUS)
// null

check(undefined, any, enUS)
// null
```

### `atLeast`

```java
atLeast :: <A>(lb : A) => Schema_<A, A>
```

Matches a value at least as big as the provided lower bound `lb`.

```typescript
const schema = 
  atLeast(100)
  
check(88, schema, enUS)
// 'Must be at least 100'
```

### `atMost`

```java
atMost :: <A>(ub : A) => Schema_<A, A>
```

Matches a value at most as big as the provided upper bound `ub`.

```typescript
const schema = 
  atMost(100)
  
check(88, schema, enUS)
// 'Must be at most 100'
```

### `between`

Matches a value between the provided lower and upper bounds (inclusive)

```java
between :: (lb : number, ub : number) => Schema_<number, number>
```

```typescript
check(99, schema, enUS)
// 'Must be between 100 and 200'

check(201, schema, enUS)
// 'Must be between 100 and 200'

check(100, schema, enUS)
// null

check(200, schema, enUS)
// null
```

### `boolean`

Matches a boolean.

```java
boolean :: Schema_<boolean, boolean>
```

### `date`

Matches a `Date` object.

```java
date :: Schema_<Date, Date>
```

### `email`

Matches an email (validated using a permissive regular expression)

```java
email :: Schema_<string, string>
```

### `emptyString`

Matches the empty string

```java
emptyString :: Schema_<string, string>
```

### `even`

Matches an even number

```java
even :: Schema_<number, number>
```

### `exactly`

Creates a schema that matches a single value, optionally using an equality comparison operator.

```java
exactly :: <A>(target : A, equals : (x : A, y : A) => boolean = (x, y) => x === y) => Schema_<A, A> 
```

```typescript
check('abc', exactly('abc'), enUS)
// null

check('abd', exactly('abc'), enUS)
// 'Must be abc'

check('abd', exactly('abc', (x, y) => x.length === y.length), enUS)
// null
```

### `id`

```java
id :: <A>() => Schema_<A, A>
```

The identity schema that always succeeds. Unlike `any`, `id` can be provided a type
argument other than the `any` type.

```typescript
const schema = 
  object({ foo: id<number>() })
  
check({ foo: 123 }, schema, enUS)
// null

check({ foo: 'hi!' }, schema, enUS)
// evaluates to null, but has a type error
```

### `integer`

Match a whole number

```java
integer :: Schema_<number, number>
```

### `length`

Match an object with property length matching the schema argument

```java
length :: <A extends { length : number }>(...vs : Schema<number, any>[]) => Schema_<A, A>
```

```typescript
const username = 
  string(length(exactly(10)))

const items = 
  array(between(1, 10))
```

### `lessThan`

Match a number less than the provided upper bound `ub`

```java
lessThan :: (ub : number) => Schema_<number, number>
```

### `lift`

Lift a function into a schema that uses the function for parsing.

```typescript
const schema = 
   pipe(toNumber, lift(x => x + 1))

result('123', schema)
// 124
```

### `match`

Match a string matching the provided regular expression.

```typescript
const greeting =
  match(/Hello|Hi|Hola/, m => m.mustBe('a greeting'))

check('Hello', greeting, enUS)
// null

check('Yo', greeting, enUS)
// 'Must be a greeting'
```               

### `moreThan`

Match a number more than the provided lower bound `lb`

```java
moreThan :: (lb : number) => Schema_<number, number>
```

### `number`

Match any number

```java
number :: Schema_<number, number>
```

### `objectExact`

Like `object` but match the object exactly, i.e. error if additional
keys to the ones specified are present.

### `objectInexact`

Like `object` but match the object inexactly, i.e. whereas `object`
will silently remove any keys not specified in the schema,
`objectInexact` will keep them.

### `odd`

Matches an odd number

```java
odd :: Schema_<number, number>
```

### `oneOf`

Match exactly one of the given elements

```typescript
const weekend =
  oneOf('Fri', 'Sat', 'Sun'),

check('Sat', weekend, enUS)
// null

check('Wed', weekend, enUS)
// Must be Fri, Sat or Sun
```

### `swap`

Swap elements 

```java
swap :: <A>(dict : [[A, A]]) => Schema_<A, A>
```

```typescript
const optionalToEmptyString =
  swap([[undefined, ''], [null, '']])

result(null, optionalToEmptyString)
// ''

result(undefined, optionalToEmptyString)
// ''

result('foo', optionalToEmptyString)
// 'foo'
```

### `optionalTo`

Map `null` and `undefined` to another value.

```java
optionalTo :: <A>(to : A) => Schema<null | undefined | A, A>;
```

```typescript
const schema =
  pipe(optionalTo(''), length(atMost(3)))

result(null, schema)
// ''

check(null, schema, enUS)
// null'

check('123123', schema, enUS)
// 'Must have length at most 3.'
```

### `pair`

Create a schema for pairs or values from a pair of schemas (where a
pair is a typed two-element array)

```java
pair :: <A, B, C, D>(v : Schema<A, C>,w : Schema<B, D>) => Schema_<[A, B], [C, D]> 
```

```typescript
const schema =
  pair(toNumber, toDate)

result(['123', '2019-12-12'], schema)    
// [ 123, 2019-12-12T00:00:00.000Z ]
```

### `path`

Set the `path` that a schema reports errors at.

```java
path :: <A, B>(path : string, v : Schema<A, B>) => Schema<A, B>
```

```typescript
const schema =
      path('foo', number)

check('', schema, enUS)
// 'Foo must be a number'
```

### `size`

`size` is the same as `length` except using the `size` property. Usable
for sets etc.

```java
size :: <A extends { size : number }>(...vs : Schema<number, any>[]) => Schema_<A, A>
```

### `string`

Match a string

```java
string :: Schema_<string, string>
```

### `sum`

Match an array with sum matching the schema argument.

```java
sum :: (...vs : Schema<number, any>[]) => Schema_<number[], number[]>
```

```typescript
const schema =
  sum(atLeast(10))

check([1,2,3], schema, enUS)
// Must have sum at least 10
```


### `toDate`

Convert a string to a date. Simply parses the string using the date
constructor which can be unreliable, so you may want to use [date-fns](https://date-fns.org/) instead.

```java
toDate :: Schema_<string, Date>
```

### `toJSON`

Converts a string to JSON.

```java
toJSON :: Schema_<string, any>
```

### `toNumber`

Converts a string to a number.

```java
toNumber :: Schema_<string, number>
```

### `toString`

Converts a value to a string.

```java
toString :: Schema_<string, string>
```

### `toURL`

Converts a string to an [URL](https://developer.mozilla.org/en-us/docs/Web/API/URL) object.

### `unknown`

Successfully parses a value (same as `any`) but types it as unknown.

## Collection related schemas

<a href="#array">array</a> &bull;
<a href="#iterable">iterable</a> &bull;
<a href="#map">map</a> &bull;
<a href="#set">set</a> &bull;
<a href="#toarray">toArray</a> &bull;
<a href="#tomap">toMap</a> &bull;
<a href="#tomapfromobject">toMapFromObject</a> &bull;
<a href="#toset">toSet</a>

### `array`

Create a schema on arrays from a schema on its values.

```java
array :: <A, B>(v : Schema<A, B>,) : Schema_<A[], B[]>
```

```typescript
const schema =
  array(toNumber)

result(['1', '2', '3'], schema)
// [1, 2, 3]

check(['1', '2', true], schema, enUS)
// Element #3 must be a string
```
### `iterable`

Match any `Iterable` value.

```java
iterable :: <A>() => Schema_<Iterable<A>, Iterable<A>>
```

```typescript
const schema =
  iterable<string>()

check(['hello', 'world'], schema, enUS)
// null
```

### `map`

Create a schema that matches a `Map` from schemas describing the keys
and values respectively.

```
map :: <A, B, C, D>(k : Schema<A, C>, v : Schema<B, D>) => Schema_<Map<A, B>, Map<C, D>>
```

```typescript
const schema =
  map(number(atLeast(10)), string(length(atLeast(1))))

check(new Map([[1, 'a'], [2, 'b'], [3, 'c']]), schema, enUS)
// Element #1.key must be at least 10

check(new Map([[11, 'a'], [12, 'b'], [13, '']]), schema, enUS)
// Element #3.value must have length at least 1

check(new Map([[11, 'a'], [12, 'b'], [13, 'c']]), schema, enUS)
// null
```

### `set`

Create a schema for a Set from a schema describing the values of the set.

```java
set :: <A, B>(v : Schema<A, B>) => Schema_<Set<A>, Set<B>>
```

```typescript
const schema = 
  set(any)

check(new Set([1, 'a', true], schema, enUS)
// null

check([1, 'a', true], schema, enUS)
// 'Must be a set'
```

```typescript
const schema = 
  set(toNumber)

parse(new Set(['1', '2', '3']))
// Set(3) { 1, 2, 3 }
```

### `toArray`

Convert an iterable to an array.

```java
toArray :: <A>() => Schema_<Iterable<A>, A[]>
```

### `toMap`

Convert an iterable of pairs to a Map

```java
toMap :: <A, B>() => Schema_<Iterable<[A, B]>, Map<A, B>>
```

### `toMapFromObject`

Convert an objet into a Map.

```java
toMapFromObject :: <A extends symbol | string | number, B>() : Schema_<{ [key in A]: B }, Map<A, B>>
```

```typescript
result({ 'a': 3, 'b': 10, 'c': 9 }, toMapFromObject())
// Map(3) { 'a' => 3, 'b' => 10, 'c' => 9 }
```

It only works on "real" objects.

```typescript
check('', toMapFromObject(), enUS)
// 'Must be an object'
```

### `toSet`

Convert an iterable of values into a set.

```java
toSet :: <A>() : Schema_<Iterable<A>, Set<A>> 
```

## Factory functions

Factory functions let you create new schema definitions.

### `createSchema`

```java
createSchema :: <A, B>(
  parse : SchemaFactory<A, B>,
  unparse : SchemaFactory<B, A> = irreversible('createSchema')
) : Schema_<A, B>
```

Create a schema from two "parser factories" for each "direction" of
parsing.  (See [Bidirectionality](./src/docs/bidirectionali.md).) A
single factory may be provided, but the schema will not be invertible.

A `SchemaFactory` is simply a function of type
```typescript
type SchemaFactory<A, B> = (a : A) => Action<{
  parse?: { ok : boolean, msg : string | Message },
  validate?: { ok : boolean, msg : string | Message },
  result?: B,
  score?: number
}>
```

All properties are optional and described below.

##### `result`

Provide this if the schema performs any parsing. This is the result
value of the parsing. A schema performs parsing when it transforms the
input of the schema into something else, e.g. by transforming a string
representation of a date into a `Date`-object.

##### `parse`

Provide this if the schema is doing any parsing. (See `result`)

The `ok` parameter indicates whether the parse was
successful. `message` is the error message describing what the parser does.

##### `validate`

Provide this if the schema is doing any validation. The `ok` parameter
indicates whether the validation was successful.  `message` is the
error message describing what the parser does.

##### `score`

The score is used by `bueno` to generate better error messages in
certain situations. You're most likely fine not providing it.

You may however optionally proide a `score` between 0 and 1 to
indicate how successful the schema was. This will by default be either
0 or 1 depending on whether the schema successfully handled its input
or not.

An example of a schema that uses a non-binary score is
`array(number)`. If we ask this schema to handle the input
`[1,2,3,4,'5']` it will be ranked with a score of 4/5.

Here's an example, creating a schema matching a "special" number.

```typescript
const special = number(createSchema(
  async function(a : number) {
    // `createSchema` may be async.
    await new Promise(k => setTimeout(k, 100))
    return {
      validate: {
        ok: [2, 3, 5, 7, 8].indexOf(a) >= 0,
        msg: (l : Builder) => l.mustBe('a special number')>
      },
      // Transform the special number into a string.
      result: '' + a
    }
  }
))
```

## Types

### `Schema<A, B>`

The type of a schema. Converts a value of type `A` into one of type `B`
and validates the result.

### `Schema_<A, B>`

A `Schema` that can be used with "call syntax". An example of a
`Schema_` is `number`, and it can be enhanced by calling it
with additional arguments.

```typescript
const schema = 
  number(even, atLeast(12))
```

### `Action`

An `Action<A>` is either an `A` or a `Promise<A>`. A schema returing a
`Promise` will be asynchronous.


### `Builder`

A builder is an object that contains methods for building error
messages when using type-safe i18n. See [customizing
errors](./src/docs/customizing-errors.md)

### `Message`

This type is used to create error messages that are independent of a
specific locale.

It is a value of type `<Rep>(l : MessageBuilder<Rep>) => Rep`. I.e. it
uses a message builder to create a representation of an error
message. An example would be

```typescript
<Rep>(l : MessageBuilder<Rep>) => l.mustBe('a thingy!')
```

(The `'a thingy!` is hard-coded to english here. We can extend the
grammar of `MessageBuilder` to accommodate this. See <a
href="./src/docs/customizing-errors.md">Customzing error messages</a>)
