import { Schema_ } from '../types'
import { match } from './match'

export const email : Schema_<string, string> = match(
  /[^@]+@[^\.]+\..+/,
  l => l.email
)
