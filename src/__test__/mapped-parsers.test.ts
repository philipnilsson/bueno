import { currency } from './currency'
import { run } from './run'

describe('mapping objects and using as parsers', () => {
  test('parse / valid', async () => {
    expect(
      await run(currency.parse_, {
        amount: '188.00e0',
        currency: 'USD'
      })
    ).toEqual([
      [],
      '$188',
      1
    ])
  })

  test('parse / invalid', async () => {
    expect(
      await run(currency.parse_, {
        amount: '188.00',
        currency: 'DKK'
      })
    ).toEqual([
      ['Currency must be one of USD or SEK'],
      '$188',
      0.75
    ])
  })

  test('parse / both invalid', async () => {
    expect(
      await run(currency.parse_, { amount: '188k', currency: 'DKK' })
    ).toEqual([
      [
        'Amount must be a number',
        'Currency must be one of USD or SEK'
      ],
      '$0',
      0.625
    ])
  })

  test('unparse / ok', async () => {
    expect(
      await run(currency.unparse_, '$0')
    ).toEqual([
      [],
      { amount: '0', currency: 'USD' },
      1
    ])
  })

  test('unparse / ok 2', async () => {
    expect(
      await run(currency.unparse_, '123 kr')
    ).toEqual([
      [],
      { amount: '123', currency: 'SEK' },
      1
    ])
  })
})
