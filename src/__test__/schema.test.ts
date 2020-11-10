import { emptyLocale, svSE, enUS, invalidDate, mkSchemaHaving, alphaNumeric, toString, self, length, object, string, flip, oneOf, toNumber, exactly, either, fix, optional, array, number, boolean, when, even, atMost, atLeast, createSchema, both, email, odd, not, objectExact, objectInexact, defaultTo, pipe, lift, id, chain, updateMessage, path, apply, iterable, toArray, toSet, set, toMap, map, toMapFromObject, toURL, every, some, toDate, emptyString, setMessage, compact, between, check, match, swap, result, optionalTo, pair, any, toJSON } from '../index'
import { Schema_, Schema } from '../types'
import { parse, parseAsync, unparse } from './run'
import { MessageBuilder } from 'bueno/locale'
import { checkPerKey } from '../schema/runners/checkByKey'

describe('schema', () => {
  test('simple parse and serialize / ok', () => {
    const schema = object({
      foo: string,
      bar: string
    })

    expect(parse({ foo: 'hi', bar: 'world' }, schema, enUS)).toEqual({
      error: null,
      result: { foo: 'hi', bar: 'world' },
      errorsByKey: {}
    })

    expect(unparse({ foo: 'hi', bar: 'world' }, schema, enUS)).toEqual({
      error: null,
      result: { foo: 'hi', bar: 'world' },
      errorsByKey: {}
    })
  })

  test('simple parse and serialize / invalid', () => {
    const schema = object({
      foo: string,
      bar: string
    })

    expect(parse({ bar: 'world' } as any, schema, enUS)).toEqual({
      error: 'Foo must be a string',
      result: { foo: '', bar: 'world' },
      errorsByKey: {
        foo: 'Must be a string'
      }
    })

    expect(unparse({ bar: 'world' } as any, schema, enUS)).toEqual({
      error: 'Foo must be a string',
      result: { foo: '', bar: 'world' },
      errorsByKey: {
        foo: 'Must be a string'
      }
    })
  })
})


describe('date', () => {
  test('ok', () => {
    expect(parse('1999-12-01', toDate, enUS)).toEqual({
      result: new Date('1999-12-01'),
      error: null,
      errorsByKey: {}
    })
  })

  test('invalid / 1', () => {
    expect(parse('1999-13-01', toDate, enUS)).toEqual({
      result: invalidDate,
      error: 'Must be a date',
      errorsByKey: {
        '': 'Must be a date'
      }
    })
  })

  test('invalid / 2', () => {
    expect(parse(123 as any, toDate, enUS)).toEqual({
      result: invalidDate,
      error: 'Must be a string',
      errorsByKey: {
        '': 'Must be a string'
      }
    })
  })

  test('unparse / ok', () => {
    expect(parse(new Date('1999-12-01'), flip(toDate), enUS)).toEqual({
      result: '1999-12-01',
      error: null,
      errorsByKey: {}
    })
  })

  test('unparse / invalid 1', () => {
    expect(parse(123 as any, flip(toDate), enUS)).toEqual({
      result: '',
      error: 'Must be a date',
      errorsByKey: {
        '': 'Must be a date'
      }
    })
  })

  test('unparse / invalid 1', () => {
    expect(parse(new Date(''), flip(toDate), enUS)).toEqual({
      result: '',
      error: 'Must be a date',
      errorsByKey: {
        '': 'Must be a date'
      }
    })
  })
})

describe('one-of', () => {
  test('parse / ok', () => {
    expect(parse('a', oneOf(...'abcdefghi'), enUS)).toEqual({
      result: 'a',
      error: null,
      errorsByKey: {}
    })
  })

  test('parse / invalid', () => {
    expect(parse('x', oneOf(...'abcdefghi'), enUS)).toEqual({
      result: 'a',
      error: 'Must be one of a, b, c, d, e, f, g, h or i',
      errorsByKey: {
        '': 'Must be one of a, b, c, d, e, f, g, h or i'
      }
    })
  })

  test('parse / ok', () => {
    expect(parse('a', flip(oneOf(...'abcdefghi')), enUS)).toEqual({
      result: 'a',
      error: null,
      errorsByKey: {}
    })
  })

  test('unparse / invalid', () => {
    expect(unparse('x', oneOf(...'abcdefghi'), enUS)).toEqual({
      result: 'a',
      error: 'Must be one of a, b, c, d, e, f, g, h or i',
      errorsByKey: {
        '': 'Must be one of a, b, c, d, e, f, g, h or i',
      }
    })
  })
})

describe('object', () => {
  const movie = object({
    released: toDate,
    rating: toNumber
  })

  const book = object({
    author: string,
    ISBN: exactly('ABCD1234')
  })

  const ouvre =
    either(book, movie)

  test('object with no call signature', () => {
    expect(parse(0 as any, object, enUS)).toEqual({
      error: 'Must be an object',
      result: {},
      errorsByKey: {
        '': 'Must be an object'
      }
    })
  })

  test('object with boolean logic / ok 1', () => {
    expect(parse({ released: '1989-04-21', rating: '9.8' } as any, ouvre, enUS)).toEqual({
      error: null,
      result: {
        released: new Date('1989-04-21'),
        rating: 9.8
      },
      errorsByKey: {}
    })

    expect(unparse({ released: new Date('1989-04-21'), rating: 9.8 } as any, ouvre, enUS)).toEqual({
      error: null,
      result: {
        released: '1989-04-21',
        rating: '9.8'
      },
      errorsByKey: {}
    })
  })

  test('object with boolean logic / ok 2', () => {
    expect(unparse({ author: 'Stephen King', ISBN: 'ABCD1234' } as any, ouvre, enUS)).toEqual({
      error: null,
      result: {
        author: 'Stephen King',
        ISBN: 'ABCD1234'
      },
      errorsByKey: {}
    })
  })
})

describe('fix', () => {
  test('fix / ok 1', () => {
    type BinTree<A> = {
      left : BinTree<A> | null,
      right : BinTree<A> | null,
      value : A
    }

    const bintree = fix<BinTree<string>, BinTree<number>>(
      bintree => object({
        left: either(exactly(null), bintree),
        right: either(exactly(null), bintree),
        value: toNumber
      })
    )

    const tree : BinTree<string> = {
      left: {
        right: {
          left: null,
          right: null,
          value: '3'
        },
        left: null,
        value: '2'
      },
      right: {
        left: null,
        right: null,
        value: '4'
      },
      value: '1'
    }

    expect(parse(tree, bintree, enUS)).toEqual({
      error: null,
      result: {
        left: {
          left: null,
          right: {
            left: null,
            right: null,
            value: 3
          },
          value: 2
        },
        right: {
          left: null,
          right: null,
          value: 4
        },
        value: 1
      },
      errorsByKey: {}
    })
  })

  test('fix / invalid 1', () => {
    type BinTree<A> = {
      left?: BinTree<A>,
      right?: BinTree<A>,
      value : A
    }

    const bintree = fix<BinTree<string>, BinTree<number>>(
      bintree => compact(object({
        left: optional(bintree),
        right: optional(bintree),
        value: toNumber
      }))
    )

    const tree : BinTree<string> = {
      left: {
        right: {
          right: {
            right: { value: 10 as any },
            value: '9'
          },
          value: '3'
        },
        value: '2'
      },
      right: {
        value: '4'
      },
      value: '1'
    }

    expect(parse(tree, bintree, enUS)).toEqual({
      error: 'Left.right.right.right.value must be a string',
      result: {
        left: {
          right: {
            right: {
              right: { value: 0 as any },
              value: 9
            },
            value: 3
          },
          value: 2
        },
        right: {
          value: 4
        },
        value: 1
      },
      errorsByKey: {
        left: {
          right: {
            right: {
              right: {
                value: 'Must be a string',
              },
            },
          },
        }
      }
    })
  })
})

test('fix / invalid 2', () => {
  type BinTree<A> = {
    left : BinTree<A> | null,
    right : BinTree<A> | null,
    value : A
  }

  const bintree = fix<BinTree<string>, BinTree<number>>(
    bintree => object({
      left: either(exactly(null), bintree),
      right: either(exactly(null), bintree),
      value: toNumber
    })
  )

  const tree : BinTree<string> = {
    left: {} as any,
    right: null,
    value: '123'
  }

  expect(parse(tree, bintree, enUS)).toEqual({
    error: 'Left must be null or left.left must be null or an object',
    result: {
      left: { left: null, right: null, value: 0 },
      right: null,
      value: 123
    },
    errorsByKey: {
      left: {
        '': 'Must be null when left.left is not null or an object',
        left: 'Must be null or an object when left is not null',
        right: 'Must be null or an object when left is not null',
        value: 'Must be a string when left is not null'
      }
    },
  })
})

test('fix / multiple nest / invalid', async () => {

  type Rec<A> = (A | Rec<A>)[]

  const z = fix<Rec<string>, Rec<number>>(v => {
    return array(either(v, toNumber))
  })

  expect(parse(
    {} as any,
    z,
    enUS
  )).toEqual({
    error: 'Must be an array',
    result: [],
    errorsByKey: {
      '': 'Must be an array'
    }
  })

  expect(parse(
    [{}] as any,
    z,
    enUS
  )).toEqual({
    error: 'Element #1 must be an array or string',
    result: [[]],
    errorsByKey: {
      '0': 'Must be an array or string',
    }
  })

  expect(
    parse([[[{}]]] as any, z as any, enUS)
  ).toEqual({
    error: 'Element #1.1.1 must be an array or string or element #1.1 must be a string',
    result: [[[[]]]],
    errorsByKey: {
      '0': {
        '0': {
          '': 'Must be a string when element #1.1.1 is not an array or string',
          '0': 'Must be an array or string when element #1.1 is not a string'
        }
      }
    }
  })
})

describe('"implication style" messages', () => {
  test('invalid 1', () => {
    const schema = either(
      object({ foo: number, bar: string }),
      object({ baz: boolean, qux: exactly(null) })
    )
    expect(parse({ foo: 123, bar: null as any }, schema, enUS)).toEqual({
      error: 'Bar must be a string or baz must be true or false',
      errorsByKey: {
        bar: 'Must be a string when baz is not true or false',
        baz: 'Must be true or false when bar is not a string',
        qux: 'Must be null when bar is not a string',
      },
      result: {
        bar: '',
        foo: 123,
      },
    })
  })
})

describe('when', () => {
  describe('simple case', () => {
    const v = when(even, atMost(10), atLeast(20))
    test('ok / consequent', () => {
      expect(parse(8, v, enUS)).toEqual({
        errorsByKey: {},
        result: 8,
        error: null
      })
    })

    test('ok / alternate', () => {
      expect(parse(21, v, enUS)).toEqual({
        errorsByKey: {},
        result: 21,
        error: null
      })
    })

    test('invalid / consequent', () => {
      expect(parse(12, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at most 10 when even'
        },
        result: 12,
        error: 'Must be at most 10 when even'
      })
    })

    test('invalid / alternate', () => {
      expect(parse(11, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at least 20 when not even'
        },
        result: 11,
        error: 'Must be at least 20 when not even'
      })
    })

    test('invalid / alternate', () => {
      expect(parse(11, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at least 20 when not even'
        },
        result: 11,
        error: 'Must be at least 20 when not even'
      })
    })
  })

  type Builder = MessageBuilder<any>

  const special = number(createSchema(
    async function(a : number) {
      // `createSchema` may be async.
      await new Promise(k => setTimeout(k, 100))
      return {
        validate: {
          msg: (l : Builder) => l.mustBe('a special number'),
          ok: [2, 3, 5, 7, 8].indexOf(a) >= 0
        }
      }
    }
  ))

  describe('disjunction in condition', () => {

    const v = when(either(even, special), atMost(5), atLeast(20))

    test('ok / consequent', async () => {
      expect(await parseAsync(4, v, enUS)).toEqual({
        errorsByKey: {},
        result: 4,
        error: null
      })
    })

    test('ok / alternate', async () => {
      expect(await parseAsync(21, v, enUS)).toEqual({
        errorsByKey: {},
        result: 21,
        error: null
      })
    })

    test('invalid / consequent / lhs', async () => {
      expect(await parseAsync(12, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at most 5 when even'
        },
        result: 12,
        error: 'Must be at most 5 when even'
      })
    })

    test('invalid / consequent / rhs', async () => {
      expect(await parseAsync(7, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at most 5 when a special number'
        },
        result: 7,
        error: 'Must be at most 5 when a special number'
      })
    })

    test('invalid / alternate 1', async () => {
      const v = when(either(even, special), atMost(5), atLeast(20))
      expect(await parseAsync(11, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at least 20 when not even and not a special number'
        },
        result: 11,
        error: 'Must be at least 20 when not even and not a special number'
      })
    })
  })

  describe('conjunction in condition', () => {
    const v = when(both(even, special), atMost(5), atLeast(20))
    test('ok / consequent', async () => {
      expect(await parseAsync(2, v, enUS)).toEqual({
        errorsByKey: {},
        result: 2,
        error: null
      })
    })

    test('ok / consequent', async () => {
      expect(await parseAsync(21, v, enUS)).toEqual({
        errorsByKey: {},
        result: 21,
        error: null
      })
    })

    test('invalid / consequent', async () => {
      expect(await parseAsync(3, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at least 20 when not even'
        },
        result: 3,
        error: 'Must be at least 20 when not even'
      })
    })

    test('invalid / alternate 2', async () => {
      expect(await parseAsync(6, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at least 20 when not a special number'
        },
        result: 6,
        error: 'Must be at least 20 when not a special number'
      })
    })

    test('invalid / alternate 3', async () => {
      expect(await parseAsync(8, v, enUS)).toEqual({
        errorsByKey: {
          '': 'Must be at most 5 when even and a special number'
        },
        result: 8,
        error: 'Must be at most 5 when even and a special number'
      })
    })
  })

  describe('with object', () => {
    type User = { verified : boolean, email : string | null }
    const verified : Schema_<User, User> =
      object({
        verified: exactly(true),
      }) as any

    const v = when(
      verified,
      object({ email: string(email) }) as any,
      object({ email: exactly(null) }) as any,
    )

    test('ok', () => {
      expect(parse({ email: null, verified: false }, v, enUS)).toEqual({
        error: null,
        errorsByKey: {},
        result: { email: null },
      })
    })

    test('invalid', () => {
      expect(parse({ email: null, verified: true }, v, enUS)).toEqual({
        error: 'Email must be a string when verified is true',
        errorsByKey: {
          '': 'Email must be a string when verified is true',
          email: 'Must be a string when verified is true'
        },
        result: { email: '' },
      })
    })

    test('having', () => {
      const schema = when(length(atLeast(1)), length(odd))
      expect(parse([1, 2, 3, 4], schema, enUS)).toEqual({
        error: 'Must have length odd when having length at least 1',
        result: [1, 2, 3, 4],
        errorsByKey: {
          '': 'Must have length odd when having length at least 1'
        }
      })
    })

    test('parse / having', () => {
      const schema = when(
        array(number)(length(atLeast(1))),
        array(number)(length(odd))
      )
      expect(parse([1, 2, 3, 4], schema, enUS)).toEqual({
        error: 'Must have length odd when having length at least 1',
        result: [1, 2, 3, 4],
        errorsByKey: {
          '': 'Must have length odd when having length at least 1'
        }
      })
    })

    test('not having', () => {
      const schema = when(not(length(atLeast(10))), length(even))
      expect(parse([1, 2, 3], schema, enUS)).toEqual({
        error: 'Must have length even when not having length at least 10',
        result: [1, 2, 3],
        errorsByKey: {
          '': 'Must have length even when not having length at least 10'
        }
      })
    })

    test('unparse / having', () => {
      const schema = when(
        length(atLeast(1)),
        length(odd)
      )

      expect(unparse([1, 2, 3, 4], schema, enUS)).toEqual({
        error: 'Must have length odd when having length at least 1',
        result: [1, 2, 3, 4],
        errorsByKey: {
          '': 'Must have length odd when having length at least 1',
        }
      })
    })

    test('unparse / having 2', () => {
      const schema = when(
        array(number)(length(atLeast(1))),
        length(odd)
      )

      expect(unparse([1, 2, 3, 4], schema, enUS)).toEqual({
        error: 'Must have length odd when every element is a number',
        result: [1, 2, 3, 4],
        errorsByKey: {
          '': 'Must have length odd when every element is a number'
        }
      })
    })

    test('parse / having', () => {
      const schema = when(
        array(number),
        length(odd)
      )

      expect(parse([1, 2, 3, 4], schema, enUS)).toEqual({
        error: 'Must have length odd when every element is a number',
        result: [1, 2, 3, 4],
        errorsByKey: {
          '': 'Must have length odd when every element is a number',
        }
      })
    })
  })
})

describe('self', () => {
  type User = {
    verified : boolean,
    email : string | null
  }

  function ifThenElse<A, B, C, D>(
    condition : boolean,
    cons : Schema<A, B>,
    alter : Schema<C, D>
  ) : Schema<A | C, B | D> {
    return condition ? cons : alter as any
  }

  const v = self<User, User>(self => {
    return object({
      verified: boolean,
      email: ifThenElse(self.verified, email, exactly(null))
    })
  })

  test('ok', () => {
    expect(parse({ verified: true, email: 'foo@bar.com' }, v, enUS)).toEqual({
      errorsByKey: {},
      error: null,
      result: { verified: true, email: 'foo@bar.com' }
    })
  })

  test('invalid / 1', () => {
    expect(parse({ verified: false, email: 'foo@bar.com' }, v, enUS)).toEqual({
      error: 'Email must be null',
      result: { verified: false, email: null },
      errorsByKey: {
        email: 'Must be null'
      },
    })
  })

  test('invalid / 2', () => {
    expect(parse({ verified: true, email: null }, v, enUS)).toEqual({
      error: 'Email must be a valid email address',
      result: { verified: true, email: null },
      errorsByKey: {
        email: 'Must be a valid email address',
      },
    })
  })

  test('self reference in errors', () => {
    const validator = object({
      email: self<string>(address => setMessage(email, `${address} is not a valid email`))
    })
    expect(parse({ email: 'foo@bar' }, validator, enUS).errorsByKey).toEqual({
      email: 'Foo@bar is not a valid email',
    })
  })
})

describe('exact object', () => {
  const v = objectExact({
    a: exactly(true),
    b: number
  })

  it('ok', () => {
    expect(parse({ a: true, b: 99 }, v, enUS)).toEqual({
      error: null,
      result: { a: true, b: 99 },
      errorsByKey: {}
    })
  })

  it('invalid / x1', () => {
    expect(parse({ a: true, b: 123, c: 'hi!' } as any, v, enUS)).toEqual({
      error: 'Must not have unexpected key c',
      result: { a: true, b: 123 },
      errorsByKey: {
        '': 'Must not have unexpected key c'
      }
    })
  })

  it('invalid / x2 ', () => {
    expect(parse({ a: true, b: 123, c: 'hi!', d: 12 } as any, v, enUS)).toEqual({
      error: 'Must not have unexpected keys c and d',
      result: { a: true, b: 123 },
      errorsByKey: {
        '': 'Must not have unexpected keys c and d',
      }
    })
  })

  it('invalid / x3 ', () => {
    expect(parse({ a: true, b: 123, c: 'hi!', d: 12, e: undefined } as any, v, enUS)).toEqual({
      error: 'Must not have unexpected keys c, d and e',
      result: { a: true, b: 123 },
      errorsByKey: {
        '': 'Must not have unexpected keys c, d and e'
      }
    })
  })

  it('invalid / regular key ', () => {
    expect(parse({ a: true, b: true, c: 'hi!', d: 12, e: undefined } as any, v, enUS)).toEqual({
      error: 'B must be a number',
      result: { a: true, b: 0 },
      errorsByKey: {
        '': 'Must not have unexpected keys c, d and e',
        b: 'Must be a number'
      }
    })
  })
})

describe('inexact object', () => {
  const v = objectInexact({
    a: string,
    b: number
  })

  test('null', () => {
    expect(parse(null as any, object({} as any), enUS)).toEqual({
      error: 'Must be an object',
      errorsByKey: {
        '': 'Must be an object',
      },
      result: {}
    })
  })

  test('ok', () => {
    expect(parse({ a: 'a', b: 2, c: true }, v, enUS)).toEqual({
      error: null,
      result: { a: 'a', b: 2, c: true },
      errorsByKey: {}
    })
  })

  test('invalid 1', () => {
    expect(parse({ a: 'a', b: '2', c: true } as any, v, enUS)).toEqual({
      error: 'B must be a number',
      result: { a: 'a', b: 0, c: true },
      errorsByKey: {
        b: 'Must be a number'
      }
    })
  })
})

describe('default to', () => {
  const v = defaultTo(
    { x: 99, y: 'hi!' },
    object({ x: number, y: string }),
  )

  it('ok', () => {
    expect(parse({ x: 123, y: 'test' }, v, enUS)).toEqual({
      error: null,
      errorsByKey: {},
      result: { x: 123, y: 'test' }
    })
  })

  it('invalid / parse', () => {
    expect(parse({ x: 123, y: 99 as any }, v, enUS)).toEqual({
      error: 'Y must be a string',
      errorsByKey: {
        y: 'Must be a string'
      },
      result: { x: 99, y: 'hi!' }
    })
  })
})

describe('"applicative"', () => {
  test('ap ok', () => {
    const v = pipe(
      object({
        x: toNumber,
        y: number
      }),
      lift(({ x, y }) => x + y)
    )
    expect(parse({ x: '10', y: 30 }, v, enUS)).toEqual({
      result: 40,
      error: null,
      errorsByKey: {},
    })
  })
})

describe('match', () => {
  const schema =
    match(/Hello|Hi|Hola/, m => m.mustBe('a greeting'))

  test('ok', () => {
    expect(
      check('Hello', schema, enUS)
    ).toEqual(
      null
    )
  })

  test('invalid', () => {
    expect(
      check('Yo', schema, enUS)
    ).toEqual(
      'Must be a greeting'
    )
  })
})

describe('toJSON', () => {
  test('null', () => {
    expect(
      result({ n: '123', d: 'null' }, object({ n: toNumber, d: toJSON }))
    ).toEqual(
      { n: 123, d: null }
    )
  })
  test('undefined', () => {
    const schema =
      pipe(toJSON, object({ foo: number, bar: boolean }))
    expect(
      check(undefined as any, schema, enUS)
    ).toBe('Must be a string')
  })
})

describe('swap', () => {
  const optionalToEmptyString =
    swap([[undefined, ''], [null, '']])

  test('ok', () => {
    expect(
      result(null, optionalToEmptyString)
    ).toEqual(
      ''
    )
  })

  test('ok 2', () => {
    expect(
      result(undefined, optionalToEmptyString)
    ).toEqual(
      ''
    )
  })

  test('ok 3', () => {
    expect(
      result('foo', optionalToEmptyString)
    ).toEqual(
      'foo'
    )
  })
})

describe('optionalTo', () => {
  test('check', () => {
    const schema =
      pipe(optionalTo(''), length(atMost(3)))

    expect(
      result(null, schema)
    ).toEqual('')

    expect(
      check(null, schema, enUS)
    ).toEqual(
      null
    )

    expect(
      check('123123', schema, enUS)
    ).toEqual(
      'Must have length at most 3'
    )
  })
})

describe('path', () => {
  test('check', () => {
    const schema =
      path('foo', number)

    expect(
      check('asdflkj' as any, schema, enUS)
    ).toEqual('Foo must be a number')
  })
})

describe('lift', () => {
  test('throw error', () => {
    const schema =
      lift<any, any>(_y => { throw new Error('oopsie') })

    expect(
      check(null, schema, enUS)
    ).toEqual('Oopsie')
  })

  test('throw other', () => {
    const schema =
      lift<any, any>(_y => { throw 'oopsie' })

    expect(
      check(null, schema, enUS)
    ).toEqual('Oopsie')
  })
})

describe('chain', () => {
  const schema = object({
    size: toNumber,
    elements: id<string>()
  })

  const v = chain(schema, b => object({
    size: id<number>(),
    elements: string(length(exactly(b.size)))
  }))

  test('ok', () => {
    expect(parse({ size: '3', elements: '123' }, v, enUS)).toEqual({
      error: null,
      errorsByKey: {},
      result: { size: 3, elements: '123' }
    })
  })

  test('invalid 1', () => {
    expect(parse({ size: '3', elements: '1234' }, v, enUS)).toEqual({
      error: 'Elements must have length 3',
      errorsByKey: {
        elements: 'Must have length 3',
      },
      result: { size: 3, elements: '1234' }
    })
  })

  test('invalid 2', () => {
    expect(parse({ size: null as any, elements: '1234' }, v, enUS)).toEqual({
      error: 'Size must be a string',
      errorsByKey: {
        size: 'Must be a string'
      },
      result: { size: 0, elements: '1234' }
    })
  })
})

describe('set', () => {
  test('check', () => {
    const schema =
      set(any)

    expect(
      check(new Set([1, 'a', true]), schema, enUS)
    ).toEqual(null)

    expect(
      check([1, 'a', true] as any, schema, enUS)
    ).toEqual('Must be a set')

    expect(result(new Set(['1', '2', '3']), set(toNumber)))
      .toEqual(new Set([1, 2, 3]))
  })
})

describe('pair', () => {
  test('check', () => {
    const schema =
      pair(toNumber, toDate)
    expect(
      result(['123', '2019-12-12'], schema)
    ).toEqual(
      [123, new Date('2019-12-12')]
    )
  })
})

describe('object with negations', () => {
  const movie = object({
    released: number(atLeast(1888)),
    title: string(not(emptyString))
  })

  const person = object({
    name: string(not(emptyString)),
    verified: exactly(true)
  })

  const schema =
    either(movie, not(person))

  test('ok / simple', async () => {
    const input = {
      released: 1983,
      title: 'Return of the Jedi'
    }

    expect(parse(input, schema, enUS)).toEqual({
      error: null,
      errorsByKey: {},
      result: input
    })
  })

  test('ok / default', async () => {
    const input = {
      name: '',
      verified: false
    }
    expect(parse(input, not(person), enUS)).toEqual({
      error: null,
      result: {
        name: '',
        verified: false
      },
      errorsByKey: {}
    })
  })

  test('3', async () => {
    const input = {
      name: 'something',
      verified: true
    }
    expect(parse(input, not(person), enUS)).toEqual({
      error: 'Name must be empty',
      result: {
        name: 'something',
        verified: true
      },
      errorsByKey: {
        name: 'Must be empty',
        verified: 'Must not be true'
      }
    })
  })

  test('4', async () => {
    const input = {
      name: 'something',
      verified: true
    }
    expect(parse(input, schema, enUS)).toEqual({
      error: 'Released must be a number or name must be empty',
      result: {
        name: 'something',
        verified: true
      },
      errorsByKey: {
        name: 'Must be empty when released is not a number',
        released: 'Must be a number when name is not empty',
        title: 'Must be a string when name is not empty',
        verified: 'Must not be true when released is not a number',
      }
    })
  })
})

describe('<x> of <y>', () => {
  const product =
    mkSchemaHaving(
      oldMsg => l => l.has('product')(oldMsg(l)),
      (arr : number[]) => ({
        result: arr.reduce((x, y) => x * y, 1),
      }))


  const schema = array(number)(product(exactly(0)))

  test('parse / product of', async () => {
    expect(parse([1, 2, 3, 4, 0], schema, enUS)).toEqual({
      error: null,
      result: [1, 2, 3, 4, 0],
      errorsByKey: {}
    })
  })

  test('parse / product of / invalid', async () => {
    expect(parse([1, 2, 3], schema, enUS)).toEqual({
      error: 'Must have product 0',
      result: [1, 2, 3],
      errorsByKey: {
        '': 'Must have product 0'
      }
    })
  })

  test('unparse / product of', async () => {
    expect(unparse([1, 2, 3, 4, 0], schema, enUS)).toEqual({
      error: null,
      result: [1, 2, 3, 4, 0],
      errorsByKey: {}
    })
  })

  test('unparse / product of / invalid', async () => {
    expect(unparse([1, 2, 3], schema, enUS)).toEqual({
      error: 'Must have product 0',
      result: [1, 2, 3],
      errorsByKey: {
        '': 'Must have product 0'
      }
    })
  })
})

describe('when / self', () => {

  type Schedule = {
    weekday : string
    price : number
  }

  const weekend = updateMessage(
    () => l => l.mustBe('a weekend'),
    oneOf('Sat', 'Sun'),
  )

  const mk = (schedule : Schedule) => {
    const isWeekend =
      apply(weekend, schedule.weekday, 'weekday')

    return object({
      weekday: oneOf('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
      price: number(when(isWeekend, atLeast(100)))
    })
  }

  const schema = self<Schedule>(mk, mk)

  test('parse', () => {
    expect(parse({ weekday: 'Sat', price: 77 }, schema, enUS)).toEqual({
      error: 'Price must be at least 100 when weekday is a weekend',
      result: {
        'price': 77,
        'weekday': 'Sat',
      },
      errorsByKey: {
        '': 'Price must be at least 100 when weekday is a weekend',
        price: 'Must be at least 100 when weekday is a weekend',
      }
    })

    expect(parse({ weekday: 'Sun', price: 100 }, schema, enUS)).toEqual({
      error: null,
      result: {
        'price': 100,
        'weekday': 'Sun',
      },
      errorsByKey: {}
    })

    expect(parse({ weekday: 'Fri', price: 30 }, schema, enUS)).toEqual({
      error: null,
      result: {
        'price': 30,
        'weekday': 'Fri',
      },
      errorsByKey: {}
    })
  })

  test('unparse', () => {
    expect(unparse({ weekday: 'Sat', price: 77 }, schema, enUS)).toEqual({
      error: 'Price must be at least 100 when weekday is a weekend',
      result: {
        'price': 77,
        'weekday': 'Sat',
      },
      errorsByKey: {
        '': 'Price must be at least 100 when weekday is a weekend',
        price: 'Must be at least 100 when weekday is a weekend'
      }
    })

    expect(parse({ weekday: 'Sun', price: 100 }, schema, enUS)).toEqual({
      error: null,
      result: {
        'price': 100,
        'weekday': 'Sun',
      },
      errorsByKey: {}
    })

    expect(parse({ weekday: 'Fri', price: 30 }, schema, enUS)).toEqual({
      error: null,
      result: {
        'price': 30,
        'weekday': 'Fri',
      },
      errorsByKey: {}
    })
  })
})

describe('collections', () => {

  test('iterable / ok', () => {
    expect(parse([], iterable(), enUS)).toEqual({
      error: null,
      result: [],
      errorsByKey: {}
    })
  })

  test('iterable / fail', () => {
    expect(parse(10 as any, iterable(), enUS)).toEqual({
      error: 'Must be iterable',
      result: [],
      errorsByKey: {
        '': 'Must be iterable',
      }
    })
  })

  test('toArray / ok', () => {
    const schema = pipe(toArray<number>(), array(number))
    const input = new Set([1, 2, 3])
    expect(parse(input, schema, enUS)).toEqual({
      error: null,
      result: [1, 2, 3],
      errorsByKey: {}
    })
  })

  test('toArray / fail / type', () => {
    const schema = toArray<number>()
    expect(parse(null as any, schema, enUS)).toEqual({
      error: 'Must be iterable',
      errorsByKey: {
        "": 'Must be iterable'
      },
      result: [],
    })
  })

  test('toArray / fail in pipe', () => {
    const schema = pipe(toArray<number>(), array(number))
    const input = new Set(['1', '2', '3']) as any

    expect(parse(input, schema, enUS)).toEqual({
      error: "Element #1 must be a number",
      errorsByKey: {
        "0": "Must be a number",
      },
      result: [0, 0, 0],
    })
  })

  test('toSet / ok', () => {
    const schema = pipe(toSet<string>(), set(toNumber))
    function* input() {
      yield '1';
      yield '2';
      yield '3'
    }
    expect(parse(input(), schema, enUS)).toEqual({
      error: null,
      result: new Set([1, 2, 3]),
      errorsByKey: {},
    })
  })

  test('toSet / fail / pipe', () => {
    const schema = pipe(toSet<string>(), set(toNumber))
    const input = new Set(['1', '2', 3]) as any
    expect(parse(input, schema, enUS)).toEqual({
      error: 'Element #3 must be a string',
      errorsByKey: {
        '2': 'Must be a string',
      },
      result: new Set([1, 2, 0])
    })
  })

  test('toSet / fail / type', () => {
    const schema = pipe(toSet<string>(), set(toNumber))
    expect(parse(null as any, schema, enUS)).toEqual({
      'error': 'Must be iterable',
      errorsByKey: {
        '': 'Must be iterable',
      },
      result: new Set()
    })
  })


  test('toMap / ok', () => {
    const schema =
      pipe(toMap<string, number>(), map(toNumber, toString<number>()))

    function* input() {
      yield ['1', 1] as [string, number]
      yield ['2', 2] as [string, number]
      yield ['3', 3] as [string, number]
    }
    expect(parse(input(), schema, enUS)).toEqual({
      error: null,
      result: new Map([[1, '1'], [2, '2'], [3, '3']]),
      errorsByKey: {},
    })
  })

  test('toMap / ok 2', () => {
    const schema =
      map(number(atLeast(10)), string(length(atLeast(1))))


    expect(check(new Map([[1, 'a'], [2, 'b'], [3, 'c']]), schema, enUS))
      .toEqual('Element #1.key must be at least 10')

    expect(check(new Map([[11, 'a'], [12, 'b'], [13, '']]), schema, enUS))
      .toEqual('Element #3.value must have length at least 1')

    expect(check(new Map([[11, 'a'], [12, 'b'], [13, 'c']]), schema, enUS))
      .toEqual(null)
  })

  test('toMap / fail / key', () => {
    const schema =
      pipe(toMap<string, boolean>(), map(toNumber, boolean))

    const input =
      new Map<string, boolean>([['1', true], ['2', true], ['hi!', false]])

    expect(parse(input, schema, enUS)).toEqual({
      error: 'Element #3.key must be a number',
      errorsByKey: {
        '2': {
          key: 'Must be a number',
        }
      },
      result: new Map([[1, true], [2, true], [0, false]])
    })
  })

  test('toMap / fail / value', () => {
    const schema =
      pipe(toMap<string, boolean>(), map(toNumber, boolean))

    const input =
      new Map<string, boolean>([['1', true], ['2', true], ['3', '' as any]])

    expect(parse(input, schema, enUS)).toEqual({
      error: 'Element #3.value must be true or false',
      errorsByKey: {
        '2': {
          value: 'Must be true or false'
        }
      },
      result: new Map([[1, true], [2, true], [3, false]])
    })
  })

  test('toMap / fail / type', () => {
    const schema =
      map(toNumber, boolean)

    expect(parse([] as any, schema, enUS)).toEqual({
      'error': 'Must be a map',
      errorsByKey: {
        '': 'Must be a map',
      },
      result: new Map()
    })
  })

  test('toMap / fail / type', () => {
    const schema =
      map(toNumber, boolean)

    expect(parse([] as any, schema, enUS)).toEqual({
      'error': 'Must be a map',
      errorsByKey: {
        '': 'Must be a map',
      },
      result: new Map()
    })
  })

  test('toMapFromObject / ok', () => {
    const input = {
      'a': 3,
      'b': 10,
      'c': 9
    }
    const res =
      new Map([['a', 3], ['b', 10], ['c', 9]])

    expect(parse(input, toMapFromObject(), enUS)).toEqual({
      error: null,
      result: res,
      errorsByKey: {}
    })

    expect(unparse(res, toMapFromObject(), enUS)).toEqual({
      error: null,
      result: input,
      errorsByKey: {}
    })
  })

  test('toMapFromObject / fail', () => {
    expect(parse(null as any, toMapFromObject(), enUS)).toEqual({
      error: 'Must be an object',
      result: new Map(),
      errorsByKey: {
        '': 'Must be an object'
      }
    })

    expect(unparse(null as any, toMapFromObject(), enUS)).toEqual({
      error: 'Must be a map',
      result: {},
      errorsByKey: {
        '': 'Must be a map'
      }
    })
  })

})

describe('utils', () => {
  test('toURL / ok', () => {
    expect(parse('https://www.google.com', toURL, enUS)).toEqual({
      error: null,
      result: new URL('https://www.google.com'),
      errorsByKey: {}
    })
  })

  test('toURL / fail', () => {
    expect(parse('://www.google.com', toURL, enUS)).toEqual({
      error: 'Must be a valid URL',
      result: new URL('http://www.example.com'),
      errorsByKey: {
        '': 'Must be a valid URL'
      }
    })
  })
})

describe('override error message', () => {

  const thing = setMessage(
    object({ foo: string, bar: number }),
    'should be a thingamajig',
  )

  test('standalone / ok', () => {
    expect(parse({ foo: '', bar: 0 }, thing, enUS)).toEqual({
      error: null,
      result: { foo: '', bar: 0 },
      errorsByKey: {}
    })
  })

  test('standalone / invalid', () => {
    expect(parse({ foo: '' } as any, thing, enUS)).toEqual({
      error: 'Should be a thingamajig',
      result: { foo: '', bar: 0 },
      errorsByKey: {
        '': 'Should be a thingamajig'
      }
    })
  })

  test('mixed / invalid', () => {
    expect(parse({} as any, either(thing, number), enUS)).toEqual({
      error: 'Should be a thingamajig or must be a number',
      result: { foo: '', bar: 0 },
      errorsByKey: {
        '': 'Should be a thingamajig or must be a number'
      }
    })
  })

  test('object / invalid', () => {
    expect(parse({} as any, object({ qux: thing }), enUS)).toEqual({
      error: 'Qux should be a thingamajig',
      result: { qux: { foo: '', bar: 0 } },
      errorsByKey: {
        qux: 'Should be a thingamajig'
      }
    })
  })
})

describe('alpha-numeric', () => {
  test('ok', () => {
    expect(parse('abc', alphaNumeric, enUS)).toEqual({
      error: null,
      result: 'abc',
      errorsByKey: {},
    })
  })

  test('empty string', () => {
    expect(parse('', alphaNumeric, enUS)).toEqual({
      error: null,
      result: '',
      errorsByKey: {},
    })
  })

  test('invalid', () => {
    expect(parse('abc|', alphaNumeric, enUS)).toEqual({
      error: 'Must have letters and numbers only',
      result: 'abc|',
      errorsByKey: {
        '': 'Must have letters and numbers only',
      },
    })
  })
})

describe('between', () => {
  const schema =
    between(100, 200)

  test('lower', () => {
    expect(
      check(99, schema, enUS)
    ).toEqual(
      'Must be between 100 and 200'
    )
  })

  test('higher', () => {
    expect(
      check(201, schema, enUS)
    ).toEqual(
      'Must be between 100 and 200'
    )
  })

  test('just right', () => {
    expect(
      check(100, schema, enUS)
    ).toEqual(
      null
    )

    expect(
      check(200, schema, enUS)
    ).toEqual(
      null
    )
  })
})

describe('exactly', () => {
  const schema =
    exactly('abc')

  test('ok', () => {
    expect(
      check('abc', schema, enUS)
    ).toEqual(
      null
    )
  })

  test('invalid', () => {
    expect(
      check('abd', schema, enUS)
    ).toEqual(
      'Must be abc'
    )
  })

  const schema2 =
    exactly('abc', (x, y) => x.length === y.length)

  test('comparison / ok', () => {
    expect(
      check('abc', schema2, enUS)
    ).toEqual(
      null
    )
  })

  test('comparison / ok 2', () => {
    expect(
      check('abd', schema2, enUS)
    ).toEqual(
      null
    )
  })

  test('comparison / invalid', () => {
    expect(
      check('ab', schema2, enUS)
    ).toEqual(
      'Must be abc'
    )
  })
})

describe('every / some', () => {
  const schema = object({
    x: every(
      string(length(atLeast(5))),
      string(length(atMost(10)))
    ),
    y: some(
      emptyString,
      string(length(atMost(5))),
      string(length(atLeast(10)))
    ),
  })

  test('valid', async () => {
    expect(unparse({ x: '123456', y: '' }, schema, enUS)).toEqual({
      error: null,
      result: { x: '123456', y: '' },
      errorsByKey: {}
    })
  })

  test('invalid', async () => {
    expect(unparse({ x: '123|', y: '123456' }, schema, enUS)).toEqual({
      error: 'X must have length at least 5',
      result: { x: '123|', y: '123456' },
      errorsByKey: {
        x: 'Must have length at least 5',
        y: 'Must be empty or must have length at most 5 or at least 10',
      }
    })
  })
})

describe('sans locale', () => {
  test('using {} as locale when providing a custom error', () => {
    const schema =
      setMessage(number, 'Should be a nice number!')

    expect(
      check('foo' as any, schema, emptyLocale)
    ).toEqual(
      'Should be a nice number!'
    )
  })
})

describe('sv-SE', () => {
  test('when', () => {
    const schema =
      when(even, atLeast(10), atMost(9))

    expect(check(8, schema, svSE)).toEqual(
      'Måste vara som minst 10 när jämnt'
    )

    expect(checkPerKey({ foo: 8 }, object({ foo: schema }), svSE)).toEqual({
      "": "Foo måste vara som minst 10 när foo är jämnt",
      foo: 'Måste vara som minst 10 när foo är jämnt'
    })
  })
})
