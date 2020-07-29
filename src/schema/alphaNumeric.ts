import { Schema_ } from '../types'
import { match } from './match'

export const alphaNumeric : Schema_<string, string> = match(
  /[a-zA-Z0-9]*/,
  l => l.alphanum
)
