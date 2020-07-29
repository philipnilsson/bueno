# Usage example with formik

Integrating `bueno` with `formik`/`react` is very easy and requires
only using the existing functions provided.

```typescript
import { atLeast, checkPerKey, either, enUS, even, flip, object, number, string, length, result } from 'bueno'

const mySchema = object({
  num: number(either(even, atLeast(100))),
  str: string(length(atLeast(5))),
})

const Form = () => {
  const formik = useFormik({
    initialValues: 
      { num: 0, str: 'hello' },
    validate: 
      // Simply use `checkPerKey` or checkPerKeyAsync` for validation.
      values => checkPerKey(values, mySchema, enUS),
    onSubmit: function(values) {
      // The form values.
      console.log(values)
      // You may sometimes wish to `flip` the schema if you're doing any 
      // parsing and want to send the form result back to an API endpoint
      console.log(result(values, flip(mySchema)))
    }
  })

  // Implement your form using `formik.values` and `formik.errors`
  // as usual
  return (
    <form onSubmit={formik.handleSubmit}>
      ...
    </form>
  )
}
```
