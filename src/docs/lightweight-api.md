# Lightweight API validation using `bueno`.

<img src="./logo.png" width="300px" />
<br />

`bueno` is library for writing *composable* validation schemas in
TypeScript. Schemas of the kind that you can pretty much just
understand by reading them (and to write yourself with very little
additional effort).

```typescript
const mySchema = object({
  foo: either(number(atLeast(2)), string),
  bar: array(number)(length(
    either(exactly(0), atLeast(3))
  ))
})
```

In spite of being quite expressive, `bueno` is still able to generate
useful error messages *automatically* without any further input from the
schema writer.

```typescript
>> checkPerKey({ foo: 1, bar: [1] }, mySchema, enUS)

{
  foo: 'Must be at least 2 or a string',
  bar: 'Must have length 0 or at least 3'
}
```

This let's us quickly write some really decent data validation for
API:s that'll also be super helpful for the caller when your API gets
invoked with incorrect data.

Of course, `bueno` will not be a replacement for e.g. `JSON-schema` or
similar projects that'll typically interface with a lot of other, more
complex and sophisticated tooling. Nor is it intended to.

However, if you have a simple node API in e.g. Express that you'd like
to add some validation to without spending the time to set up new
tools, `bueno` adds quite a lot of bang for the buck for the few
minutes you'll need to [get started](../../README.md#quickstart)

Importantly, it'll also get you **type-safe data handling,
auto-completion and all the other TypeScript IDE goodies** for your
request data at a very low cost.

Here's a full example in `express`

```typescript
import express from 'express'
import bodyParser from 'body-parser'
import { atLeast, optional, boolean, either, enUS, even, object, number, string, length, result, checkPerKey, toNumber } from 'bueno'

const mySchema = object({
    params: object({
        id: toNumber(either(even, atLeast(100)))
    }),
    query: object({
        name: optional(string(length(atLeast(5))))
    }),
    body: object({
        foo: number,
        bar: boolean
    })
})

express()
    .post('/hi/:id', bodyParser.json(), (req: any, res: any) => {
        const errors = checkPerKey(req, mySchema, enUS)
        if (Object.keys(errors).length) {
            return res.status(500).send(JSON.stringify(errors, null, 2) + '\n')
        }
        const data = result(req, mySchema)
        return res.status(200).send('Ok!\n')
    })
    .listen(3030)
```

Auto-completion now working on the data!

<img src="./auto.png" title="Editor auto completion" width="400"/>

and below - some of the helpful error responses the client will receive.

Hope you'll enjoy using `bueno` to harden all those slightly neglected
API:s that haven't received the full attention of having more complex
tooling set up!

```sh
>> curl -d '' 'http://localhost:3030/hi/99'
{
  "body": {
    "bar": "Must be true or false",
    "foo": "Must be a number"
  },
  "params": {
    "id": "Must be even or at least 100"
  }
}

>> curl -d '' 'http://localhost:3030/hi/100?name=bob'
{
  "body": {
    "bar": "Must be true or false",
    "foo": "Must be a number"
  },
  "query": {
    "name": "Must have length at least 5"
  }
}

>> curl -d '' 'http://localhost:3030/hi/100?name=robert'
{
  "body": {
    "bar": "Must be true or false",
    "foo": "Must be a number"
  }
}

>> curl -d '{ "foo": "123" }' --header "Content-Type: application/json" 'http://localhost:3030/hi/100?name=robert'
{
  "body": {
    "bar": "Must be true or false",
    "foo": "Must be a number"
  }
}

>> curl -d '{ "foo": 123, "bar": true  }' --header "Content-Type: application/json" 'http://localhost:3030/hi/100?name=robert'
Ok!
```
