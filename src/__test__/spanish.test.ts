import { testInputs, TestName } from './testinputs'
import { esES } from '../locales/es-ES'
import { MessageBuilder } from 'bueno/locale'
import { describePaths } from '../path'
import { Locale } from '../index'

const lang = describePaths(
  esES as Locale,
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
      'Debe ser un número',

    'no path / negated':
      'No debe ser un número',

    'simple path':
      'Bar debe ser un número',

    'simple path / negated':
      'Bar no debe ser un número',

    'or / mixed path':
      'Debe ser un número o bar debe ser un texto',

    'or / multiple paths':
      'Baz debe ser un número o bar debe ser un texto',

    'or / multiple no path':
      'Debe ser un número o texto',

    'or / negated / multiple no path':
      'No debe ser un número o texto',

    'or / negated / multiple no path / same article':
      'No debe ser un número o objeto',

    'or / multiple same path':
      'Bar debe ser un número, texto o objeto, baz debe ser un texto o baz no debe ser un objeto',

    'or / multiple different paths':
      'Barbaz debe ser un número o objeto, baz debe ser cierto o falso o baz no debe ser un texto o objeto',

    'or / multiple different paths / empty path':
      'Debe ser cierto o falso, no debe ser un texto o objeto o bar debe ser un número o objeto',

    'or / multiple different paths / empty path / adjectives':
      'Debe ser más que 10 o más que 12 o no debe ser menor que 5',

    'at every':
      'Cada elemento debe ser más que 10',
    'alpha-numeric':
      'Debe ser solo números y letras',
  },
  having: {
    'sum':
      'Debe tener una suma de al menos 10',

    'length':
      'Debe tener una longitud de al menos 10',

    'unexpected keys':
      'No debe tener llaves inesperadas foo, bar y baz'
  },
  when: {
    'simple':
      'Debe ser más que 10 cuando bar es un texto',

    'with disjunctions':
      'Debe ser más que 10 o un texto o telefonnummer debe ser un número cuando no más que 3 o un objeto, ålder es más que 18 y ålder es menor que 65',

    'when / length':
      'Debe ser parejo cuando tiene una longitud de al menos 10',

    'when / between':
      'Debe ser parejo cuando foobar está entre 10 y 20',

    'when / left out':
      'FOO debe ser parejo cuando BAR es omitido',
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
      l.at('edad', l.more(18)),
      l.at('nombre', l.less(65)),
      l.at('verificada', l.exactly('"si"'))
    ])

    expect(lang.renderer.byKey(msg(lang.builder), [])).toEqual({
      "edad": "Debe ser más que 18 cuando nombre no es menor que 65 y verificada no es \"si\"",
      "nombre": "Debe ser menor que 65 cuando edad no es más que 18 y verificada no es \"si\"",
      "verificada": "Debe ser \"si\" cuando edad no es más que 18 y nombre no es menor que 65",
    })
  })
})
