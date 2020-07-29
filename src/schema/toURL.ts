import { mkSchema } from "./factories/mkSchema"
import { mkParser_ } from "./factories/mkParser"
import { Parser_ } from "../types"
import { toStringP } from "./toString"

export const toURLP : Parser_<string, URL> = mkParser_(s => {
  let ok = false
  let url : URL = new URL('http://www.example.com')
  try {
    url = new URL(s)
    ok = true
  } catch (e) { }
  return { parse_: { ok, msg: l => l.url }, result_: url }
})

export const toURL =
  mkSchema(toURLP, toStringP())
