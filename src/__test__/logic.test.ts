import { CNF, or, and } from "../logic"

describe('logic', () => {
  test('or', () => {
    const x : CNF<string> = [
      ['a', 'b', 'c'],
      ['d', 'e']
    ]
    const y : CNF<string> = [
      ['x', 'y', 'z'],
      ['u', 'v']
    ]

    expect(or(x, y)).toEqual([
      ['a', 'b', 'c', 'x', 'y', 'z'],
      ['a', 'b', 'c', 'u', 'v'],
      ['d', 'e', 'x', 'y', 'z'],
      ['d', 'e', 'u', 'v']
    ])
  })

  test('and / true / id left', () => {
    expect(and([], [['a', 'b'], ['c']])).toEqual(
      [['a', 'b'], ['c']]
    )
  })

  test('and / true / id right', () => {
    expect(and([['a', 'b'], ['c']], [])).toEqual(
      [['a', 'b'], ['c']]
    )
  })

  test('and  / false / abs left', () => {
    expect(and([[]], [['a', 'b'], ['c']])).toEqual(
      [[]]
    )
  })

  test('and / false / abs right', () => {
    expect(and([['a', 'b'], ['c']], [[]])).toEqual(
      [[]]
    )
  })

  test('or / true / abd left', () => {
    expect(or([], [['a', 'b'], ['c']])).toEqual(
      []
    )
  })

  test('or / true / abs right', () => {
    expect(or([['a', 'b'], ['c']], [])).toEqual(
      []
    )
  })

  test('or / false / id left', () => {
    expect(or([[]], [['a', 'b'], ['c']])).toEqual(
      [['a', 'b'], ['c']]
    )
  })

  test('or / false / id right', () => {
    expect(or([['a', 'b'], ['c']], [[]])).toEqual(
      [['a', 'b'], ['c']]
    )
  })
})
