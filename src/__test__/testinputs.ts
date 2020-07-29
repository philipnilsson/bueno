import { MessageBuilder } from 'bueno/locale'

type TestGroup =
  ReturnType<typeof inputs>

export type TestName = {
  [key in keyof TestGroup]: TestGroup[key][number]['name']
}

const inputs = <IR>(l : MessageBuilder<IR>) => ({
  messages: [
    {
      name: 'no path' as const,
      input: l.number
    },
    {
      name: 'no path / negated' as const,
      input: l.not(l.number)
    },
    {
      name: 'simple path' as const,
      input: l.at('bar', l.number)
    },
    {
      name: 'simple path / negated' as const,
      input: l.not(l.at('bar', l.number))

    },
    {
      name: 'or / mixed path' as const,
      input: l.either([
        l.number,
        l.at('bar', l.string)
      ])
    },
    {
      name: 'or / multiple paths' as const,
      input: l.either([
        l.at('baz', l.number),
        l.at('bar', l.string)
      ])
    },

    {
      name: 'or / multiple no path' as const,
      input: l.either([l.number, l.string])
    },
    {
      name: 'or / negated / multiple no path' as const,
      input: l.not(l.either([l.number, l.string]))
    },
    {
      name: 'or / negated / multiple no path / same article' as const,
      input: l.not(l.either([l.number, l.object]))
    },
    {
      name: 'or / multiple same path' as const,
      input: l.either([
        l.at('bar', l.either([l.number, l.string, l.object])),
        l.at('baz', l.either([l.string])),
        l.at('baz', l.either([l.not(l.object)]))
      ])
    },
    {
      name: 'or / multiple different paths' as const,
      input: l.either([
        l.at('bar', l.at('baz', l.either([l.number, l.object]))),
        l.at('baz', l.bool),
        l.not(l.at('baz', l.either([l.string, l.object])))
      ])
    },
    {
      name: 'or / multiple different paths / empty path' as const,
      input: l.either([
        l.bool,
        l.not(l.either([l.string, l.object])),
        l.at('bar', l.either([l.number, l.object]))
      ])
    },
    {
      name: 'or / multiple different paths / empty path / adjectives' as const,
      input: l.either([
        l.more(10),
        l.more(12),
        l.not(l.less(5))
      ])
    },
    {
      name: 'at every',
      input: l.atEvery(l.more(10))
    },
    {
      name: 'alpha-numeric',
      input: l.alphanum
    }
  ],
  when: [
    {
      name: 'simple' as const,
      input: l.when(
        l.more(10),
        [l.at('bar', l.string)]
      )
    },
    {
      name: 'with disjunctions' as const,
      input: l.when(
        l.either([
          l.more(10), l.string,
          l.at('phoneNo', l.number)
        ]),
        [
          l.not(l.either([l.more(3), l.object])),
          l.at('age', l.more(18)),
          l.at('age', l.less(65))
        ]
      )
    },
    {
      name: 'when / length',
      input: l.when(
        l.even,
        [l.length(l.atLeast(10))]
      )
    },
    {
      name: 'when / between',
      input: l.when(
        l.even,
        [l.at('foobar', l.between(10, 20))]
      )
    },
    {
      name: 'when / left out',
      input: l.when(
        l.at('FOO', l.even),
        [l.at('BAR', l.leftOut)]
      )
    }
  ],
  having: [
    {
      name: 'sum',
      input: l.sum(l.atLeast(10))
    },
    {
      name: 'length',
      input: l.length(l.atLeast(10))
    },
    {
      name: 'unexpected keys',
      input: l.keys(['foo', 'bar', 'baz'])
    }
  ],
  custom: [
    {
      name: 'simple' as const,
      input: l.fromString('Should be a custom thingy!'),
    }
  ]
})

export const testInputs = inputs
