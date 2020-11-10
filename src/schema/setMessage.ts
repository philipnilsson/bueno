import { Schema_, Parser, Schema } from "../types"
import { Message } from 'bueno/locale'
import { updateMessage, updateMessageP } from "./updateMessage"
import { constant } from "../utils"

export function setMessageP<A, B>(
  v : Parser<A, B>,
  m : Message | string
) {
  return updateMessageP(constant(m), v)
}

export function setMessage<A, B>(
  v : Schema<A, B>,
  m : Message | string
) : Schema_<A, B> {
  return updateMessage(constant(m), v)
}
