import { joinWithCommas } from '../utils'
import { joinPath } from '../path'

const display =
  (x : string[]) => joinWithCommas(x, 'or')

describe('oneOf', () => {
  test('1', () => {
    expect(display([]))
      .toEqual('')
  })

  test('2', () => {
    expect(display(['foo']))
      .toEqual('foo')
  })

  test('3', () => {
    expect(display(['foo', 'bar']))
      .toEqual('foo or bar')
  })

  test('4', () => {
    expect(display(['foo', 'bar', 'baz']))
      .toEqual('foo, bar or baz')
  })

  test('5', () => {
    expect(display(['foo', 'bar', 'baz', 'quux']))
      .toEqual('foo, bar, baz or quux')
  })
})

describe('join path', () => {

  test('"" left unit', () => {
    expect(joinPath('', 'foo')).toEqual('foo')
  })

  test('"" right unit', () => {
    expect(joinPath('foo', '')).toEqual('foo')
  })

  test('happy', () => {
    expect(joinPath('foo', 'bar')).toEqual('foo.bar')
  })

  test('segment / empty', () => {
    expect(joinPath('', '_#_bar')).toEqual('_#_bar')
  })

  test('segment / foo', () => {
    expect(joinPath('foo', '_#_bar')).toEqual('_#_bar')
  })

  test('segment / segment', () => {
    expect(joinPath('_#_foo', '_#_bar')).toEqual('_#_foo')
  })
})
