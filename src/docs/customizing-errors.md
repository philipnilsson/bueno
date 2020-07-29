# Customizing errors

`bueno` let's you provide custom error messages in a few different
ways. The simplest is to use the `setMessage` combinator with a
string argument.

```typescript
import { check, emptyLocale, setMessage } from 'bueno'

const schema = 
  setMessage(number, 'You gotta provide a number!')

check('123', schema, emtpyLocale)
// 'You gotta provide a number!'

check(123, schema, emtpyLocale)
// null
```
  
This approach does not work well if you're looking to support multiple
locales though. Errors in `bueno` can be type-safely extended using
declaration merging in TypeScript.

```typescript
declare module 'bueno/locale' {
  interface MessageBuilder<IR> {
    myCustomError: IR
  }
}
```

`IR` is an intermediate representation that is locale-specific. You
won't typically need to interact with it directly.

You can now create custom locales that will be checked against the
specification you've provided.

```
const myEnUS: Locale = {
  builder: {
    ...enUS.builder,
    myCustomError: 'My custom error!'
  },
  renderer: enUS.renderer
}

const mySvSE: Locale = {
  builder: {
    ...svSE.builder,
    myCustomError: 'Mitt nya felmeddelande!'
  },
  renderer: svSE.renderer
}
```

We then use this 
