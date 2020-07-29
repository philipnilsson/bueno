import { message } from '../Builtins'
import { describePaths } from '../path'
import { enUS } from '../locales/en-US'
import { run } from './run'
import { checkPerKey as _checkPerKey } from '../schema/runners/checkByKey'
import { Language } from 'bueno/locale'
import { stringP } from '../schema/string'
import { eitherP } from '../schema/either'
import { evenP } from '../schema/even'
import { lengthP } from '../schema/length'
import { invalidDate } from '../schema/date'
import { Parser_ } from '../types'
import { whenP } from '../schema/when'
import { arrayP } from '../schema/array'
import { numberP } from '../schema/number'
import { toNumberP } from '../schema/toNumber'
import { integerP } from '../schema/integer'
import { exactlyP } from '../schema/exactly'
import { setP } from '../schema/collections/set'
import { sizeP } from '../schema/size'
import { objectP } from '../schema/object'
import { selfP } from '../schema/self'
import { pathP } from '../schema/path'
import { applyP } from '../schema/apply'
import { oneOfP } from '../schema/oneOf'
import { atLeastP } from '../schema/atLeast'
import { booleanP } from '../schema/boolean'
import { moreThanP } from '../schema/moreThan'
import { atMostP } from '../schema/atMost'
import { bothP } from '../schema/both'
import { fixP } from '../schema/fix'
import { toDateP } from '../schema/toDate'
import { optionalP } from '../schema/optional'
import { pipeP } from '../schema/pipe'
import { notP } from '../schema/not'
import { everyP } from '../schema/every'
import { someP } from '../schema/some'
import { emptyStringP } from '../schema/emptyString'
import { mkParserHaving, mkParser, Locale } from '../index'
import { sumP } from '../schema/sum'
import { compactP } from '../schema/compact'
import { mkSchema } from '../schema/factories/core'

function checkPerKey<A, B>(p : Parser_<A, B>, value : A, l : Locale = enUS) {
  return _checkPerKey(value, mkSchema(p), l)
}

describe('validators', () => {
  test('string', async () => {
    expect(await run(stringP, 'test')).toEqual([
      [],
      'test',
      1
    ])
  })

  test('string or number / string', async () => {
    expect(await run(eitherP(stringP, numberP), 'test')).toEqual([
      [],
      'test',
      1
    ])
  })

  test('string or number / number', async () => {
    expect(await run(eitherP(stringP, numberP), 123)).toEqual([
      [],
      123,
      1
    ])
  })

  test('string or number / neither', async () => {
    expect(await run(eitherP(booleanP, numberP), {})).toEqual([
      ['Must be true, false or a number']
      ,
      false,
      0
    ])
  })

  const b = bothP(numberP, evenP)

  test('conjunction', async () => {
    expect(await run(b, 123)).toEqual([
      ['Must be even'],
      123,
      0.75,
    ])
  })

  const str2ns =
    arrayP(toNumberP)(lengthP(atLeastP(3)))

  test('array or number', async () => {
    const schema = eitherP(numberP, arrayP(numberP));
    expect(await run(schema, 12)).toEqual([[], 12, 1])
  })

  test('each / ok', async () => {
    expect(await run(str2ns, ['1', '2', '3'])).toEqual([
      [],
      [1, 2, 3,],
      1,
    ])
  })

  test('each / fail', async () => {
    expect(await run(str2ns, ['1', '', '3'])).toEqual([
      ['Element #2 must be a number'],
      [1, 0, 3,],
      0.9166666666666667
    ])
  })

  test('array / fail 1', async () => {
    expect(await run(str2ns, ['1', '', '3'])).toEqual([
      ['Element #2 must be a number'],
      [1, 0, 3,],
      0.9166666666666667
    ])
  })

  test('array / fail 2', async () => {
    expect(await run(str2ns, null as any)).toEqual([
      ['Must be an array'],
      [],
      0,
    ])
  })

  test('array / fail 3', async () => {
    expect(await run(
      arrayP(eitherP(stringP, numberP))
      , [null])).toEqual([
        ['Element #1 must be a string or number'],
        [''],
        0.5,
      ])
  })

  test('array / object 2', async () => {
    expect(await run(arrayP(objectP({ a: numberP, b: stringP })), [{}])).toEqual([
      [
        'Element #1.a must be a number',
        'Element #1.b must be a string'
      ],
      [{ a: 0, b: '' }],
      0.75
    ])
  })

  test('array / object 3', async () => {
    expect(await run(arrayP(eitherP(numberP, objectP({ a: numberP, b: stringP }))), [{}])).toEqual([
      [
        'Element #1 must be a number or element #1.a must be a number',
        'Element #1 must be a number or element #1.b must be a string'
      ],
      [{ a: 0, b: '' }],
      0.75
    ])
  })

  test('array / object 4', async () => {
    expect(await run(arrayP(eitherP(numberP, objectP({ a: numberP, b: stringP }))), [{ a: 0 }])).toEqual([
      ['Element #1.b must be a string'],
      [{ a: 0, b: '' }],
      0.875
    ])
  })

  type Rose<A> = A | Rose<A>[]

  const z = fixP<Rose<string>, Rose<number>>(v => {
    return eitherP(toNumberP, arrayP(v))
  })

  test('fix / base case', async () => {
    expect(await run(z, '123')).toEqual([
      [],
      123,
      1
    ])
  })

  test('fix / one level of nesting', async () => {
    expect(await run(z, ['123'])).toEqual([
      [],
      [123],
      1
    ])
  })

  test('fix / multiple nest / valid', async () => {
    expect(await run(z, ['1', ['2', ['3'], '4', ['5', ['6']]]])).toEqual([
      [],
      [1, [2, [3], 4, [5, [6]]]],
      1
    ])
  })

  test('fix / multiple nest / invalid', async () => {
    const z = fixP<Rose<string>, Rose<number>>(v =>
      eitherP(toNumberP, arrayP(v)))

    expect(await run(z, ['1', ['2', ['3'], {} as any, ['5', ['6']]]])).toEqual([
      ['Element #2.3 must be a string or array'],
      [1, [2, [3], 0, [5, [6]]]],
      0.96875
    ])
  })

  test('fix / multiple nest / validation failure', async () => {
    const z = fixP<Rose<number>>(v => eitherP(evenP, arrayP(v)))
    expect(await run(z, [1, [2, [3], {} as any, [5, [6]]]])).toEqual([
      ['Element #1 must be even or an array'],
      [1, [2, [3], 0, [5, [6]]]],
      0.83203125
    ])
  })

  test('date / ok', async () => {
    expect(await run(toDateP, '2018-11-18')).toEqual([
      [],
      new Date('2018-11-18'),
      1
    ])
  })

  test('date / invalid', async () => {
    expect(await run(toDateP, '2018-20-18')).toEqual([
      ['Must be a date'],
      invalidDate,
      0.5
    ])
  })

  test('date / invalid 2', async () => {
    expect(await run(toDateP, null as any)).toEqual([
      ['Must be a string'],
      invalidDate,
      0
    ])
  })

  test('optional / undefined', async () => {
    expect(await run(optionalP(toDateP), undefined)).toEqual(
      [[], undefined, 1]
    )
  })

  test('optional / defined', async () => {
    expect(await run(optionalP(toDateP), '2020-12-31')).toEqual(
      [[], new Date('2020-12-31'), 1]
    )
  })

  test('optional / invalid', async () => {
    expect(await run(optionalP(toDateP), '2020-20-31')).toEqual([
      ['Must be a date or left out'],
      invalidDate,
      0.5
    ])
  })
})

describe('not', () => {
  test('parser / valid', async () => {
    expect(await run(notP(stringP), 'test')).toEqual([
      [],
      'test',
      1
    ])
  })

  test('parser / invalid', async () => {
    expect(await run(notP(stringP), 3)).toEqual([
      ['Must be a string'],
      '',
      0
    ])
  })

  test('validator / invalid', async () => {
    expect(await run(notP(evenP), 2)).toEqual([
      ['Must not be even'],
      2,
      0.5
    ])
  })

  test('validator / valid', async () => {
    expect(await run(notP(evenP), 3)).toEqual([
      [],
      3,
      1,
    ])
  })

  test('notP(disjunction) is conjunction', async () => {
    expect(await run(notP(eitherP(stringP, numberP)), 123)).toEqual([
      ['Must be a string'],
      123,
      0.5
    ])
  })

  test('conjunction / ok 1', async () => {
    expect(await run(notP(bothP(evenP, atMostP(10))), 123)).toEqual([
      [],
      123,
      1
    ])
  })

  test('conjunction / ok with negations', async () => {
    expect(await run(bothP(notP(evenP), notP(atMostP(10))), 122)).toEqual([
      ['Must not be even'],
      122,
      0.75
    ])
  })

  test('conjunction / ok with top-level negation', async () => {
    expect(await run(notP(bothP(evenP, atMostP(10))), 122)).toEqual([
      [],
      122,
      1
    ])
  })

  test('conjunction / invalid', async () => {
    expect(await run(notP(bothP(evenP, atMostP(10))), 8)).toEqual([
      // TODO: Hard to understand?
      ['Must not be even or at most 10'],
      8,
      0.5
    ])
  })

  test('not each / ok', async () => {
    const v = notP(arrayP(evenP))
    expect(await run(v, [3, 1, 9] as any)).toEqual([
      [],
      [3, 1, 9],
      1
    ])
  })

  test('not each / failure', async () => {
    const v = notP(arrayP(evenP))
    expect(await run(v, ['a', 1] as any)).toEqual([
      ['Element #1 must be a number'],
      [0, 1],
      0.75
    ])
  })
})

describe('object', () => {
  test('object with no call signature', async () => {
    expect(await run(objectP, 0)).toEqual([
      ['Must be an object'],
      {},
      0
    ])
  })

  test('array / object 1', async () => {
    expect(await run(arrayP(objectP({ a: numberP, b: stringP })), [0])).toEqual([
      ['Element #1 must be an object'],
      [{ a: 0, b: '' }],
      0.5
    ])
  })
  test('ok', async () => {
    const v = objectP({
      a: evenP,
      b: stringP
    })
    expect(await run(v, { a: 10, b: 'test' } as any)).toEqual([
      [],
      {
        a: 10,
        b: 'test'
      },
      1
    ])
  })

  test('parse failure', async () => {
    const v = objectP({
      a: evenP,
      b: stringP
    })
    expect(await run(v, {} as any)).toEqual([
      [
        'A must be a number',
        'B must be a string'
      ],
      {
        a: 0,
        b: ''
      },
      0.5
    ])
  })

  test('one validation error', async () => {
    const v = objectP({
      a: evenP,
      b: stringP
    })
    expect(await run(v, { a: 11, b: 'test' } as any)).toEqual([
      ['A must be even'],
      {
        a: 11,
        b: 'test'
      },
      0.875
    ])
  })

  test('two validation errors', async () => {
    const v = objectP({
      a: evenP,
      b: notP(emptyStringP)
    })
    expect(await run(v, { a: 11, b: '' } as any)).toEqual([
      [
        'A must be even',
        'B must not be empty',
      ],
      {
        a: 11,
        b: ''
      },
      0.75
    ])
  })

  test('non-object', async () => {
    const v = objectP({
      a: evenP,
      b: notP(emptyStringP)
    })
    expect(await run(v, undefined as any)).toEqual([
      ['Must be an object'],
      { a: 0, b: '' },
      0
    ])
  })

  const movie = objectP({
    released: atLeastP(1888),
    title: eitherP(stringP, notP(emptyStringP))
  })

  const book = objectP({
    author: stringP,
    ISBN: exactlyP('ABCD1234')
  })

  test('book ', async () => {
    expect(await run(book, {
      released: 1984,
      title: 'test'
    } as any)).toEqual([
      [
        'Author must be a string',
        'ISBN must be ABCD1234'
      ],
      {
        author: '',
        ISBN: 'ABCD1234'
      },
      0.5
    ])
  })

  test('movie', async () => {
    expect(await run(movie, {
      released: 1983,
      title: 'Return of the Jedi'
    } as any)).toEqual([
      [],
      {
        released: 1983,
        title: 'Return of the Jedi'
      },
      1
    ])
  })

  test('book or movie / movie', async () => {
    const ouvre = eitherP(book, movie)

    expect(await run(ouvre, {
      released: 1983,
      title: 'Return of the Jedi'
    } as any)).toEqual([
      [],
      {
        released: 1983,
        title: 'Return of the Jedi'
      },
      1
    ])
  })

  test('book or movie / book', async () => {
    const ouvre = eitherP(book, movie)

    expect(await run(ouvre, {
      author: 'Stephen King',
      ISBN: 'ABCD1234'
    } as any)).toEqual([
      [],
      {
        author: 'Stephen King',
        ISBN: 'ABCD1234'
      },
      1
    ])
  })

  test('book or movie / validation error', async () => {
    const movie = objectP({
      released: numberP(atLeastP(1888)),
      title: notP(emptyStringP)
    })

    const book = objectP({
      author: stringP,
      ISBN: exactlyP('ABCD1234')
    })

    const ouvre = eitherP(book, movie)

    expect(await run(ouvre, {
      author: 123,
      ISBN: 'ABCD1234'
    } as any)).toEqual([
      [
        'Author must be a string or released must be a number',
        'Author must be a string or title must be a string'
      ],
      {
        author: '',
        ISBN: 'ABCD1234',
      },
      0.75,
    ])
  })

  test('undefined:s in object "compacted"', async () => {
    const schema = compactP(objectP({
      a: optionalP(atMostP(10)),
      b: optionalP(exactlyP(2)),
    }))
    expect(Object.keys((await run(schema, {}))[1]))
      .toEqual([])
  })

  test('empty object input to validator', async () => {
    const schema = objectP({})
    expect(await run(schema, { a: 10 })).toEqual([
      [],
      { a: 10 },
      1
    ])
  })

  test('mix object / primitive', async () => {
    const schema = eitherP(numberP, objectP({ a: numberP, b: stringP }))
    expect(await run(schema, 'test')).toEqual([
      [
        'Must be a number or object'
      ],
      0,
      0
    ])
  })

  test('mix object / primitive 2', async () => {
    const schema = eitherP(numberP, objectP({ a: numberP, b: stringP }))
    expect(await run(schema, { a: 1 })).toEqual([
      [
        'B must be a string',
      ],
      {
        a: 1,
        b: ''
      },
      0.75
    ])
  })

  test('mix object / primitive 3', async () => {
    const schema = eitherP(numberP, objectP({ a: numberP, b: eitherP(stringP, numberP) }))
    expect(await run(schema, { a: 1 })).toEqual([
      [
        'B must be a string or number'
      ],
      {
        a: 1,
        b: ''
      },
      0.75
    ])
  })

  test('nested object', async () => {
    const schema = objectP({
      x: toNumberP,
      y: eitherP(stringP, objectP({
        z: stringP,
        w: booleanP
      }))
    })
    expect(await run(schema, {
      x: '123',
      y: {
        z: '!!',
        w: true
      }
    })).toEqual([
      [],
      { x: 123, y: { z: '!!', w: true } },
      1
    ])
  })
})

describe('length', () => {
  test('ok', async () => {
    const x = objectP({
      name: stringP(lengthP(atLeastP(2), atMostP(10))),
      ssn: stringP(lengthP(exactlyP(5)))
    })

    expect(await run(x, { name: 'Bob', ssn: 'abcde' })).toEqual([
      [],
      { name: 'Bob', ssn: 'abcde' },
      1
    ])
  })

  test('invalid type', async () => {
    const x = lengthP(exactlyP(3))
    expect(await run(x, 123)).toEqual([
      ['Must be an array or string'],
      123,
      0,
    ])
  })

  test('invalid 1', async () => {
    const x = objectP({
      name: stringP(lengthP(atLeastP(2), atMostP(10))),
      ssn: stringP(lengthP(exactlyP(5)))
    })

    expect(await run(x, { name: 'B', ssn: 'abcde' })).toEqual([
      ['Name must have length at least 2'],
      { name: 'B', ssn: 'abcde' },
      0.96875
    ])
  })

  test('invalid / not', async () => {
    const x = objectP({
      name: stringP(lengthP(notP(exactlyP(1)), atMostP(10))),
      ssn: stringP(lengthP(exactlyP(5)))
    })

    expect(await run(x, { name: 'B', ssn: 'abcde' })).toEqual([
      ['Name must not have length 1'],
      { name: 'B', ssn: 'abcde' },
      0.96875
    ])
  })

  test('invalid 2', async () => {
    const x = objectP({
      name: stringP(lengthP(atLeastP(2), atMostP(10))),
      ssn: stringP(lengthP(exactlyP(5)))
    })

    expect(await run(x, { name: 'Bob', ssn: 'abcd' })).toEqual([
      ['Ssn must have length 5'],
      { name: 'Bob', ssn: 'abcd' },
      0.9375
    ])
  })

  test('negated length', async () => {
    expect(await run(stringP(lengthP(notP(exactlyP(5)), notP(atLeastP(2)))), 'super')).toEqual([
      [
        'Must not have length 5',
        'Must not have length at least 2'
      ],
      'super',
      0.75
    ])
  })
})

describe('self', () => {
  const v = selfP((obj : { a : number, b : string }) => objectP({
    a: numberP,
    b: stringP(lengthP(exactlyP(obj.a)))
  }))

  test('ok', async () => {
    expect(await run(v, { a: 5, b: 'abcde' })).toEqual([
      [],
      { a: 5, b: 'abcde' },
      1
    ])
  })

  test('invalid', async () => {
    expect(await run(v, { a: 5, b: 'abcd' })).toEqual([
      ['B must have length 5'],
      { a: 5, b: 'abcd' },
      0.9375
    ])
  })

  test('negated', async () => {
    const w = notP(selfP(x => exactlyP(x)))
    expect(await run(w, 10)).toEqual([
      ['Must not be 10'],
      10,
      0
    ])
  })
})

describe('pipe', () => {
  const dateToDay : Parser_<Date, number> = mkParser((d : Date) => {
    const day = d.getDay()
    return {
      parse: { ok: day <= 5, msg: message(l => l.mustBe('a weekday')) },
      result: day
    }
  })

  test('ok', async () => {
    const schema = pipeP(toDateP, dateToDay)
    expect(await run(schema, '2019-01-01')).toEqual([
      [],
      2,
      1
    ])
  })

  test('invalid first part', async () => {
    const schema = pipeP(toDateP, dateToDay)
    expect(await run(schema, '2019-99-01')).toEqual([
      ['Must be a date'],
      NaN,
      0.5
    ])
  })

  test('invalid second part', async () => {
    const schema = pipeP(toDateP, dateToDay)
    expect(await run(schema, '2019-01-05')).toEqual([
      ['Must be a weekday'],
      6,
      0.5
    ])
  })
})

describe('object with negations', () => {
  const movie = objectP({
    released: numberP(atLeastP(1888)),
    title: stringP(notP(emptyStringP))
  })

  const person = objectP({
    name: stringP(notP(emptyStringP)),
    verified: exactlyP(true)
  })

  const schema =
    eitherP(movie, notP(person))

  test('ok / lhs', async () => {
    const input = {
      released: 1983,
      title: 'Return of the Jedi'
    }
    expect(await run(schema, input))
      .toEqual([
        [],
        input,
        1
      ])
  })

  test('ok / rhs', async () => {
    const input = {
      name: '',
      verified: false
    }
    expect(await run(schema, input))
      .toEqual([
        [],
        {
          name: '',
          verified: false
        },
        1
      ])
  })

  test('fail / not / simple', async () => {
    const schema = notP(
      objectP({
        x: exactlyP(true)
      })
    )
    expect(await run(schema, { x: true })).toEqual([
      ['X must not be true'],
      { x: true },
      0.5
    ])
  })

  test('fail / default value', async () => {
    const input = {
      name: ''
    }
    expect(await run(schema, input))
      .toEqual([
        [],
        {
          name: '',
          verified: true
        },
        1
      ])
  })

  test('fail / 1', async () => {
    const input = {
      name: 'something',
      verified: true
    }
    expect(await run(notP(person), input))
      .toEqual([
        [
          'Name must be empty',
          'Verified must not be true'
        ],
        { name: 'something', verified: true },
        0.6875
      ])
  })

  test('fail / 2', async () => {
    const input = {
      name: 'something',
      verified: true
    }
    expect(await run(schema, input))
      .toEqual([
        [
          // TODO: "Score" the disjoint clauses and rewrite error to
          // e.g. "Name must be empty or released must be a number "
          'Released must be a number or name must be empty',
          'Released must be a number or verified must not be true',
          'Title must be a string or name must be empty',
          'Title must be a string or verified must not be true',
        ],
        {
          name: 'something',
          verified: true
        },
        0.6875
      ])
  })
})

describe('async validation', () => {
  function delay(n : number) {
    return new Promise(k => setTimeout(k, n))
  }

  const prime = mkParser(async function(a : number) {
    await delay(5)
    return {
      validate: {
        msg: message(l => l.mustBe('a prime less than 10')),
        ok: [2, 3, 5, 7].indexOf(a) >= 0,
      },
      result: a
    }
  })

  test('simple / valid', async () => {
    expect(await run(prime, 7)).toEqual([[], 7, 1])
  })

  test('simple / invalid', async () => {
    expect(await run(prime, 8)).toEqual([
      ['Must be a prime less than 10'],
      8,
      0
    ])
  })

  const countAs = mkParser(async (a : string) => {
    await delay(5)
    const ok = typeof a === 'string'
    return {
      parse: { ok, msg: message(l => l.string) },
      result: ok ? a.replace(/[^a]/g, '').length : 0,
    }
  })

  test('parser / valid', async () => {
    expect(await run(countAs, 'aabbaac')).toEqual([
      [],
      4,
      1
    ])
  })

  test('parser / invalid', async () => {
    expect(await run(countAs, 123 as any)).toEqual([
      ['Must be a string'],
      0,
      0
    ])
  })

  test('combined / ok 1', async () => {
    expect(await run(eitherP(prime, countAs), 'aa')).toEqual([
      [],
      2,
      1
    ])
  })

  test('combined / ok 2', async () => {
    expect(await run(eitherP(prime, countAs), 'aa')).toEqual([
      [],
      2,
      1
    ])
  })

  test('either / invalid 1', async () => {
    expect(await run(eitherP(prime, countAs), 9)).toEqual([
      ['Must be a prime less than 10 or a string'],
      9,
      0
    ])
  })

  test('pipe / ok', async () => {
    expect(await run(pipeP(countAs, prime), 'aaa')).toEqual([
      [],
      3,
      1
    ])
  })

  test('pipe / invalid 1', async () => {
    expect(await run(pipeP(countAs, prime), 3 as any)).toEqual([
      ['Must be a string'],
      0,
      0
    ])
  })

  test('pipe / invalid 2', async () => {
    expect(await run(pipeP(countAs, prime), 'aaaa')).toEqual([
      ['Must be a prime less than 10'],
      4,
      0.5
    ])
  })

  test('both / ok', async () => {
    expect(await run(eitherP(prime, evenP), 2)).toEqual([
      [],
      2,
      1
    ])
  })

  test('both / invalid', async () => {
    expect(await run(bothP(prime, evenP), 3)).toEqual([
      ['Must be even'],
      3,
      0.75
    ])
  })

  test('object / ok', async () => {
    expect(await run(
      objectP({ i: prime, c: countAs }),
      { i: 7, c: '8aabbcca' }
    )).toEqual([
      [],
      { i: 7, c: 3 },
      1
    ])
  })

  test('object / invalid', async () => {
    expect(await run(
      objectP({ i: prime, c: pipeP(countAs, evenP) }),
      { i: 6, c: '8aabbcca' }
    )).toEqual([
      [
        'I must be a prime less than 10',
        'C must be even'
      ],
      { i: 6, c: 3 },
      0.6875
    ])
  })
})

describe('errors per key', () => {
  const user = objectP({
    name: optionalP(stringP),
    password: stringP(lengthP(atLeastP(8))),
    age: numberP(atLeastP(18))
  })

  const signupData = objectP({
    user,
    terms: objectP({
      accepted: exactlyP(true),
      receiveNewsletter: eitherP(exactlyP(true), exactlyP(false))
    })
  })

  test('object', () => {
    const l = describePaths(enUS as Language<any, any>, [
      ['*.password', 'Password'],
      ['*.age', 'Age']
    ])

    expect(checkPerKey(user, {} as any, l)).toEqual({
      password: 'Must be a string',
      age: 'Must be a number'
    })
  })

  test('nested object', () => {
    expect(checkPerKey(signupData, { user: {}, terms: {} } as any)).toEqual({
      user: {
        password: 'Must be a string',
        age: 'Must be a number'
      },
      terms: {
        accepted: 'Must be true',
        receiveNewsletter: 'Must be true or false'
      }
    })
  })

  test('non-object', () => {
    expect(checkPerKey(numberP, null as any)).toEqual({
      '': 'Must be a number'
    })
  })

  const v = eitherP(numberP, objectP({ n: numberP }))

  test('mixed-object', () => {
    expect(checkPerKey(v, {} as any)).toEqual({
      '': 'Must be a number when n is not a number',
      n: 'Must be a number when not a number',
    })
  })

  test('when with dict', () => {
    const l = describePaths(enUS as Language<any, any>, [
      ['user', 'application user'],
      ['user.password', 'system password'],
      ['*.name', 'user firstname'],
    ])

    const schema = eitherP(
      objectP({ user: objectP({ password: atLeastP(10) }) }),
      objectP({ name: stringP })
    )

    expect(checkPerKey(schema, {} as any, l)).toEqual({
      name: 'Must be a string when application user is not an object',
      user: 'Must be an object when user firstname is not a string'
    })

    expect(checkPerKey(schema, { user: {} } as any, l)).toEqual({
      name: 'Must be a string when system password is not at least 10',
      user: {
        password: 'Must be at least 10 when user firstname is not a string'
      }
    })
  })
})

describe('when', () => {
  test('invalid / 1', async () => {
    const v = whenP(evenP, moreThanP(10))
    expect(await run(v, 8)).toEqual([
      ['Must be more than 10 when even'],
      8,
      0
    ])
  })

  test('invalid / disj', async () => {
    const v = whenP(
      eitherP(evenP, atLeastP(5)),
      moreThanP(10)
    )
    expect(await run(v, 9)).toEqual([
      ['Must be more than 10 when at least 5'],
      9,
      0
    ])
  })

  test('invalid / conj', async () => {
    const v = whenP(bothP(evenP, atLeastP(5)), moreThanP(10))
    expect(await run(v, 6)).toEqual([
      ['Must be more than 10 when even and at least 5'],
      6,
      0
    ])
  })

  test('with else / ok', async () => {
    const v = whenP(evenP, atMostP(10), atLeastP(20))
    expect(await (run(v, 23))).toEqual([[], 23, 1])
  })

  test('with else / lhs', async () => {
    const v = whenP(evenP, numberP(atMostP(10)), numberP(atLeastP(20)))
    expect(await (run(v, 12))).toEqual([
      ['Must be at most 10 when even',],
      12,
      0.5,
    ])
  })

  test('with else / invalid', async () => {
    const v = whenP(evenP, numberP(atMostP(10)), numberP(atLeastP(20)))
    expect(await (run(v, 13))).toEqual([
      ['Must be at least 20 when not even'],
      13,
      0.5,
    ])
  })

  test('having / 1', async () => {
    const schema = whenP(arrayP(evenP), arrayP(numberP(atMostP(10))))
    expect(await run(schema, [122])).toEqual([
      ['Element #1 must be at most 10 when every element is even'],
      [122],
      0.75
    ])
  })

  test('having / 2', async () => {
    const schema = whenP(
      lengthP(evenP),
      lengthP(atLeastP(10))
    )
    expect(await run(schema, [1, 2, 3, 4])).toEqual([
      ['Must have length at least 10 when having length even'],
      [1, 2, 3, 4],
      0.5
    ])
  })

  test('having / 3', async () => {
    const schema = lengthP(whenP(evenP, atLeastP(10)))
    expect(await run(schema, [1, 2])).toEqual([
      ['Must have length at least 10 when having length even'],
      [1, 2],
      0.5
    ])
  })
})

describe('every / some', () => {
  const schema = objectP({
    x: everyP([
      notP(emptyStringP),
      stringP(lengthP(atLeastP(5))),
      stringP(lengthP(atMostP(10)))
    ]),
    y: someP([
      emptyStringP,
      stringP(lengthP(atMostP(5))),
      stringP(lengthP(atLeastP(10)))
    ]),
  })

  test('valid', async () => {
    expect(await run(schema, { x: '123456', y: '' })).toEqual([
      [],
      { x: '123456', y: '' },
      1
    ])
  })

  test('invalid', async () => {
    expect(await run(schema, { x: '123', y: '123456' })).toEqual([
      [
        'X must have length at least 5',
        'Y must be empty or y must have length at most 5 or at least 10',
      ],
      { x: '123', y: '123456' },
      0.921875
    ])
  })
})

describe('sum', () => {
  test('sum of', async () => {
    const schema = sumP(atLeastP(10), atMostP(20))
    expect(await run(schema, [1, 2, 3, 4])).toEqual([
      [],
      [1, 2, 3, 4],
      1
    ])
  })

  test('sum of / invalid', async () => {
    const schema = arrayP(numberP)(sumP(atLeastP(10)))
    expect(await run(schema, [1, 2, 3])).toEqual([
      ['Must have sum at least 10'],
      [1, 2, 3],
      0.75
    ])
  })
})

describe('<x> of <y>', () => {
  const product =
    mkParserHaving(
      oldMsg => l => l.has('product')(oldMsg(l)),
      (arr : number[]) => ({
        result: arr.reduce((x, y) => x * y, 1),
      }))

  const schema =
    arrayP(numberP)(product(exactlyP(0)))

  test('product of', async () => {
    expect(await run(schema, [1, 2, 3, 4, 0])).toEqual([
      [],
      [1, 2, 3, 4, 0],
      1
    ])
  })

  test('product of / invalid', async () => {
    expect(await run(schema, [1, 2, 3])).toEqual([
      ['Must have product 0'],
      [1, 2, 3],
      0.75
    ])
  })
})

describe('when / self', () => {
  test('1', async () => {
    type Schedule = {
      weekday : 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
      price : number
    }

    const schema = selfP<Schedule>(schedule => {
      const isWeekend =
        pathP('weekday', applyP(oneOfP('Sat', 'Sun'), schedule.weekday))

      return objectP({
        weekday: oneOfP('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
        price: numberP(whenP(isWeekend, atLeastP(100)))
      })
    })

    expect(await run(schema, { weekday: 'Sat', price: 77 })).toEqual([
      [
        'Price must be at least 100 when weekday is one of Sat or Sun'
      ],
      {
        'price': 77,
        'weekday': 'Sat',
      },
      0.875
    ])

    expect(await run(schema, { weekday: 'Sun', price: 100 })).toEqual([
      [],
      {
        'price': 100,
        'weekday': 'Sun',
      },
      1
    ])

    expect(await run(schema, { weekday: 'Fri', price: 30 })).toEqual([
      [],
      {
        'price': 30,
        'weekday': 'Fri',
      },
      1
    ])
  })
})

describe('set', () => {
  const schema =
    setP(numberP)(sizeP(exactlyP(3)))

  test('set / ok', async () => {
    expect(await run(schema, new Set([1, 2, 3]))).toEqual([
      [],
      new Set([1, 2, 3]),
      1
    ])
  })

  test('set / failed 1', async () => {
    expect(await run(schema, new Set([1, 2]))).toEqual([
      ['Must have length 3'],
      new Set([1, 2]),
      0.75
    ])
  })

  test('set / failed 1', async () => {
    expect(await run(schema, 12)).toEqual([
      ['Must be a set'],
      new Set(),
      0
    ])
  })
})

describe('integerP', () => {
  test('ok', async () => {
    expect(await run(integerP, 123)).toEqual([
      [],
      123,
      1
    ])
  })

  test('ok', async () => {
    expect(await run(integerP, 123.123)).toEqual([
      ['Must be a whole number'],
      123,
      0
    ])
  })
})
