# Bueno

## What

The tiny, composable validation library with awesome built-in
localized error messages.

## Is it any good?

Yup

You can try it in a [sandbox]('link')

```typescript


const mySchema = object({
  name: string,
  age: number(atLeast(18)),
  username: optional(string(not(empty), length(atLeast(1)))),
  magicNumber: number(either(atLeast(10), not(even))),
  bucket: optional(oneOf(1, 2, 3)),
  elements: array(number(even, atLeast(0)))(length(atLeast(1)))
})

import { number, string, email, optional, atLeast, length } from 'bueno'

const schema = object({
  name: optional(string(not(empty))),
  age: number(atLeast(18)),
  email: email,
  password: string(length(atLeast(10))),
})

const result = check(schema, {
  name: 'Philip',
  age: '34',
  email: 'phni@example',
  password: '<3'
})

{
  age: 'Must be a number',
  email: 'Must be a valid email',
  password: 'Must be of length at least 10'
}
```

```js
import { either, nonEmptyString, number, url, email, object, optional } from 'bueno'

const book = object({
  title: nonEmptyString,
  author: nonEmptyString,
  ISBN: optional(repeat(13, digit))
})

const movie = object({
  title: nonEmptyString,
  director: nonEmptyString,
  yearReleased: optional(repeat(4, digit))
})

const recommendations = 
  arrayOf(either(book, movie))

const user = object({
  id: either(string, number),
  website: url,
  email: email,
  recommendations
})
```

## Why

You may want to use `bueno` if:

### You care about bundle size

`bueno` [tree-shakes](link) well because it uses a functional style,
much like e.g. `date-fns`
 
### You use typescript

`bueno` takes great care to ensure type-safety and
"auto-completability" works to their full potential. 

[Check it out in a sandbox](link)

### i18n is important to you.

`bueno` is built with i18n in mind. 

It's compliant with i18next syntax out of the box, but can be used
standalone or with other i18n libraries.
 
### You want to easily write your own validators

Check out some examples

### You need a powerful but simple API that scales

`bueno` gives you one of the most powerful validator APIs while
staying simple, both under the hood and in its usage.

### You're not looking for a parsing library

`bueno` does one thing right - validation. Therefore it does *not*
attempt to parse values, it simply validates already parsed values. 

This matches well with libraries like React where, let's say, a
`<DatePicker .. />` component will produce a valid `Date` object.

## How

Install

```
yarn add bueno
```

or

```
npm add bueno
```

and use

```typescript
import { describeError, validate, number } from 'bueno'
import english from 'bueno/locale/en'

const user = object({
  id: either(number, string)
  email: email
})

// bueno
const { error } = validate("12323", number) // error is null

// not bueno
const { error } = validate("a2323", number)
console.log(describeError(error, english)) // "This must be a number"
```

### Usage with e.g. Formik

```typescript
import { toYupCompliantSchema, both, minLength, maxLength, email } from 'bueno'
import english from 'bueno/locale/en'

const name = 
  both(minLength(2), maxLength(50)),

const signupSchema = object({
  firstName: name,
  lastName: name,
  email
})

<Formik
  initialValues={{
    firstName: '',
    lastName: '',
    email: '',
  }}
  validationSchema={toYupCompliantSchema(signupSchema, english)}
>
  ...
</Formik>
```

### Usage with Express

```typescript
import express from 'express'
import { object, numberFromString, number, string, length, between, optional } from 'bueno'

const app = express()

app.post('/hello/:name/:age, (res, req) => {
  const schema = object({
    path: object({
      age: numberFromString,
      name: string(length(between(1, 100))),
    }),
    body: object({
      greeting: string,
    }),
    query: object({
      override_ab_test_group: optional(number),
    }) 
  })

  const {
    result: { path, body, query },
    errorsByKey,
  } = validate(req, schema)
    
  if (errors) {
    return res.status(502).json(errorsByKey)
  }
  
  // ...
})
```

### Integration with other libraries

```js
import { between, exactly } from '@bueno/core'
import { date, month, day } from '@bueno/date-fns'
import { parse } from 'date-fns'

const schema = object({
  date2020:  date(between(parse('2020-01-01'), parse('2020-12-31'))),
  christmas: date(exactly(parse('2020-12-25'))),
  summer:    month(between(6, 9)),
  weekend:   day(oneOf([0, 6]))
})
```
