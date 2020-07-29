# Bidirectionality

Bidirectionality means that the parsing element of schemas can be run
in reverse. This can be really useful for converting back and forth
between a "nice" representation and one expected e.g. by an API.

For example, we can create a simple schema to convert a string to and
from a `date-fns` representation.

```typescript
import { lift } from 'bueno'
import { parseISO, formatISO } from 'date-fns'

const date = lift(
  parseISO, 
  d => formatISO(d, { representation: 'date' })
)
```

Now, let's say we have a form where we want to edit the
following data from our API.

```typescript
const purchase = {
  currency: '99.00',
  date: '2019-08-11'
}
```

Our API has stored a currency amount and date as strings, but
we'd like to work with this data using real `Date` and `number`
objects. We simply create the following schema...

```typescript
import { lift, object, result, toNumber } from 'bueno'

// ...

const schema = object({
  currency: toNumber,
  date: date
})
```

...parse the data and edit it...

```typescript
const parsedPurchase = 
  result(schema, purchase)

parsedPurchase.currency = 110.50
parsedPurchase.date = new Date('2020-01-01')
```

...and we use the schema to convert back to the representation our API
expects.

```typescript
result(parsedPurchase, schema)
// { currency: '110.5', date: '2020-01-01' }
```

The combinators of `bueno` will maintain bidirectionality so you can
always work with data in the most convenient way without paying the
price of manually having to write code converting between various
representations.
