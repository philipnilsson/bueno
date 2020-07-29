import { testInputs, TestName } from './testinputs'
import { svSE } from '../locales/sv-SE'
import { MessageBuilder } from 'bueno/locale'
import { describePaths } from '../path'
import { Locale } from '../index'

const lang = describePaths(
  svSE as Locale,
  [
    ['*.phoneNo', 'telefonnummer'],
    ['*.age', 'ålder'],
    ['*.bar.baz', 'barbaz'],
  ]
)

const inputs =
  testInputs(lang.builder)

const outputs : { [name in keyof TestName]: { [key in TestName[name]]: string } } = {
  messages: {
    'no path':
      'Måste vara ett tal',

    'no path / negated':
      'Får inte vara ett tal',

    'simple path':
      'Bar måste vara ett tal',

    'simple path / negated':
      'Bar får inte vara ett tal',

    'or / mixed path':
      'Måste vara ett tal eller bar måste vara en text',

    'or / multiple paths':
      'Baz måste vara ett tal eller bar måste vara en text',

    'or / multiple no path':
      'Måste vara ett tal eller en text',

    'or / negated / multiple no path':
      'Får inte vara ett tal eller en text',

    'or / negated / multiple no path / same article':
      'Får inte vara ett tal eller objekt',

    'or / multiple same path':
      'Bar måste vara ett tal, en text eller ett objekt, baz måste vara en text eller baz får inte vara ett objekt',

    'or / multiple different paths':
      'Barbaz måste vara ett tal eller objekt, baz måste vara sant eller falskt eller baz får inte vara en text eller ett objekt',

    'or / multiple different paths / empty path':
      'Måste vara sant eller falskt, får inte vara en text eller ett objekt eller bar måste vara ett tal eller objekt',

    'or / multiple different paths / empty path / adjectives':
      'Måste vara mer än 10 eller mer än 12 eller får inte vara mindre än 5',

    'at every':
      'Varje element måste vara mer än 10',

    'alpha-numeric':
      'Måste ha endast bokstäver och siffror'
  },
  having: {
    'sum':
      'Måste ha summa som minst 10',

    'length':
      'Måste ha längd som minst 10',

    'unexpected keys':
      'Får inte ha oväntade nycklar foo, bar och baz',
  },
  when: {
    'simple':
      'Måste vara mer än 10 när bar är en text',

    'with disjunctions':
      'Måste vara mer än 10 eller en text eller telefonnummer måste vara ett tal när inte mer än 3 eller ett objekt, ålder är mer än 18 och ålder är mindre än 65',

    'when / length':
      'Måste vara jämnt när längd som minst 10',

    'when / between':
      'Måste vara jämnt när foobar är mellan 10 och 20',

    'when / left out':
      'FOO måste vara jämnt när BAR är utlämnad',
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
      l.at('ålder', l.more(18)),
      l.at('namn', l.less(65)),
      l.at('verifierad', l.exactly('"ja"'))
    ])

    expect(lang.renderer.byKey(msg(lang.builder), [])).toEqual({
      ålder: 'Måste vara mer än 18 när namn inte är mindre än 65 och verifierad inte är "ja"',
      namn: 'Måste vara mindre än 65 när ålder inte är mer än 18 och verifierad inte är "ja"',
      verifierad: 'Måste vara "ja" när ålder inte är mer än 18 och namn inte är mindre än 65',
    })
  })
})
