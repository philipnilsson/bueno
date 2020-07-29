import { Message } from 'bueno/locale'
import { Parser_, Schema_ } from "../types"
import { updateMessageP } from "./updateMessage"
import { mkSchema } from "./factories/mkSchema"

export function updateNestedMessagesP<A, B>(
  f : (m : Message) => Message,
  v : Parser_<A, B>
) : Parser_<A, B> {
  function call(...vs : Parser_<B, B>[]) : Parser_<A, B> {
    return v(...vs.map(x => updateMessageP(f, x)))
  }
  call.run_ = v.run_
  return call
}

export function updateNestedMessages<A, B>(
  f : (m : Message) => Message,
  v : Schema_<A, B>,
) : Schema_<A, B> {
  return mkSchema(
    updateNestedMessagesP(f, v.parse_),
    updateNestedMessagesP(f, v.unparse_),
  )
}


