import { testInputs, TestName } from './testinputs'
import { deDE } from '../locales/de-DE'
import { MessageBuilder } from 'bueno/locale'
import { describePaths } from '../path'
import { Locale } from '../index'

const lang = describePaths(
  deDE as Locale,
  [
    ['*.phoneNo', 'Telefonzahl'],
    ['*.age', 'alt'],
    ['*.bar.baz', 'barbaz'],
  ]
)

const inputs =
  testInputs(lang.builder)

const outputs : { [name in keyof TestName]: { [key in TestName[name]]: string } } = {
  messages: {
    'no path':
      'Muss eine Zahl sein',

    'no path / negated':
      'Darf nicht eine Zahl sein',

    'simple path':
      'Bar muss eine Zahl sein',

    'simple path / negated':
      'Bar darf nicht eine Zahl sein',

    'or / mixed path':
      'Muss eine Zahl sein oder bar muss ein Text sein',

    'or / multiple paths':
      'Baz muss eine Zahl sein oder bar muss ein Text sein',

    'or / multiple no path':
      'Muss eine Zahl oder ein Text sein',

    'or / negated / multiple no path':
      'Darf nicht eine Zahl oder ein Text sein',

    'or / negated / multiple no path / same article':
      'Darf nicht eine Zahl oder ein Objekt sein',

    'or / multiple same path':
      'Bar muss eine Zahl, ein Text oder Objekt sein, ' +
      'baz muss ein Text sein oder baz darf nicht ein Objekt sein',

    'or / multiple different paths':
      'Barbaz muss eine Zahl oder ein Objekt sein, baz muss wahr oder falsch sein oder baz darf nicht ein Text oder Objekt sein',

    'or / multiple different paths / empty path':
      'Muss wahr oder falsch sein, darf nicht ein Text oder Objekt sein oder bar muss eine Zahl oder ein Objekt sein',

    'or / multiple different paths / empty path / adjectives':
      'Muss mehr als 10 oder mehr als 12 sein oder darf nicht weniger als 5 sein',

    'at every':
      'Jedes Element muss mehr als 10 sein',

    'alpha-numeric':
      'Muss nur aus Buchstaben und Zahlen bestehen'
  },
  having: {
    'sum':
      'Muss eine Summe von mindestens 10 haben',

    'length':
      'Muss eine Länge von mindestens 10 haben',

    'unexpected keys':
      'Darf nicht unerwarteten Schlüssel foo, bar und baz haben'
  },
  when: {
    'simple':
      'Muss mehr als 10 sein wenn bar ein Text ist',

    'with disjunctions':
      'Muss mehr als 10 oder ein Text sein oder Telefonzahl muss eine Zahl sein wenn nicht mehr als 3 oder ein Objekt ist, alt mehr als 18 ist und alt weniger als 65 ist',

    'when / length':
      'Muss gerade sein wenn es eine Länge von mindestens 10 hat',

    'when / between':
      'Muss gerade sein wenn foobar zwischen 10 und 20 liegt',

    'when / left out':
      'FOO muss gerade sein wenn BAR weggelassen wird'
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
      l.at('alt', l.more(18)),
      l.at('name', l.less(65)),
      l.at('verifiziert', l.exactly('"Ja"'))
    ])

    expect(lang.renderer.byKey(msg(lang.builder), [])).toEqual({
      "alt": "Muss mehr als 18 sein wenn name nicht weniger als 65 ist und verifiziert nicht \"Ja\" ist",
      "name": "Muss weniger als 65 sein wenn alt nicht mehr als 18 ist und verifiziert nicht \"Ja\" ist",
      "verifiziert": "Muss \"Ja\" sein wenn alt nicht mehr als 18 ist und name nicht weniger als 65 ist",
    })
  })
})
