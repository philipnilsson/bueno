import { object, oneOf, toNumber, pipe, lift } from '../index'

export class Currency {
  amount : number
  currency : string

  constructor(
    amount : number,
    currency : string
  ) {
    this.amount = amount
    this.currency = currency
  }

  format() {
    return this.currency === 'USD'
      ? `$${this.amount}`
      : `${this.amount} kr`
  }
}

export const amount = object({
  amount: toNumber,
  currency: oneOf('USD', 'SEK')
})

export const currency = pipe(
  amount,
  lift(
    ({ amount, currency }) =>
      new Currency(amount, currency).format(),
    currency => {
      if (currency.startsWith('$')) {
        return { currency: 'USD', amount: parseFloat(currency.substring(1)) }
      } else {
        return { currency: 'SEK', amount: parseFloat(currency.substring(0, currency.length - 3)) }
      }
    })
)
