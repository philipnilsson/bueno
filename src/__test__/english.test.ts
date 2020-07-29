import { testInputs, TestName } from './testinputs'
import { enUS } from '../locales/en-US'
import { MessageBuilder } from 'bueno/locale'
import { describePaths } from '../path'
import { Locale } from '../index'

const lang = describePaths(
  enUS as Locale,
  [
    ['*.phoneNo', 'phone number'],
    ['*.age', 'age'],
    ['*.bar.baz', 'barbaz'],
  ],
)

const inputs =
  testInputs(lang.builder)

const outputs : { [name in keyof TestName]: { [key in TestName[name]]: string } } = {
  messages: {
    'no path':
      'Must be a number',

    'no path / negated':
      'Must not be a number',

    'simple path':
      'Bar must be a number',

    'simple path / negated':
      'Bar must not be a number',

    'or / mixed path':
      'Must be a number or bar must be a string',

    'or / multiple paths':
      'Baz must be a number or bar must be a string',

    'or / multiple no path':
      'Must be a number or string',

    'or / negated / multiple no path':
      'Must not be a number or string',

    'or / negated / multiple no path / same article':
      'Must not be a number or object',

    'or / multiple same path':
      'Bar must be a number, string or object, baz must be a string or baz must not be an object',

    'or / multiple different paths':
      'Barbaz must be a number or object, baz must be true or false or baz must not be a string or object',

    'or / multiple different paths / empty path':
      'Must be true or false, must not be a string or object or bar must be a number or object',

    'or / multiple different paths / empty path / adjectives':
      'Must be more than 10 or more than 12 or must not be less than 5',

    'at every':
      'Every element must be more than 10',

    'alpha-numeric':
      'Must have letters and numbers only'
  },
  having: {
    'sum':
      'Must have sum at least 10',

    'length':
      'Must have length at least 10',

    'unexpected keys':
      'Must not have unexpected keys foo, bar and baz',
  },
  when: {
    'simple':
      'Must be more than 10 when bar is a string',

    'with disjunctions':
      "Must be more than 10 or a string or phone number must be a number when not more than 3 or an object, age is more than 18 and age is less than 65",

    'when / length':
      'Must be even when having length at least 10',

    'when / between':
      'Must be even when foobar is between 10 and 20',

    'when / left out':
      'FOO must be even when BAR is left out',
  },
  custom: {
    'simple':
      'Should be a custom thingy!'
  }
}

Object.keys(inputs).forEach(key => {
  describe(key, () => {
    ((inputs as any)[key] as any[]).forEach((input : any) => {
      test(input.name, () => {
        expect(lang.renderer.render(input.input, [])).toEqual((outputs as any)[key][input.name])
      })
    })
  })
})

describe('by key', () => {

  test('by key 1', () => {

    const msg = (l : MessageBuilder<any>) => l.either([
      l.at('age', l.more(18)),
      l.at('name', l.less(65)),
      l.at('verified', l.exactly(true))
    ])

    expect(lang.renderer.byKey(msg(lang.builder), [])).toEqual({
      age: 'Must be more than 18 when name is not less than 65 and verified is not true',
      name: 'Must be less than 65 when age is not more than 18 and verified is not true',
      verified: 'Must be true when age is not more than 18 and name is not less than 65'
    })
  })
})
