import { joinWithCommas, deepMerge, capFirst, push, isNumber, words, id } from '../utils'
import { IR, not, mkRenderer, atom, verb, defaultBuilder, RenderingOptions } from '../DefaultIR'
import '../Builtins'
import { MessageBuilder } from 'bueno/locale'

export type English =
  | { k : 'noun_', article_ : '' | 'a' | 'an', noun_ : string, name_ : string }

function has(name : string) : (ir : IR<English>) => IR<English> {
  return verb(
    x => ['must have', name, x],
    x => ['must not have', name, x],
    x => ['has', name, x],
    x => ['does not have', name, x],
    x => ['having', name, x],
    x => ['not having', name, x]
  )
}

const mustBe =
  verb<any>(
    x => ['must be', x],
    x => ['must not be', x],
    x => ['is', x],
    x => ['is not', x],
    x => [x],
    x => ['not', x]
  )

const mustHave =
  verb<any>('must have', 'must not have', 'has', 'does not have', 'having', 'not having')

function a(noun_ : string, name_ : string = noun_) {
  return mustBe(atom({ article_: 'a', noun_, k: 'noun_', name_ }))
}

function an(noun_ : string, name_ : string = noun_) {
  return mustBe(atom({ article_: 'an', noun_, k: 'noun_', name_ }))
}

const englishBuilder : MessageBuilder<IR<English>> = {
  ...defaultBuilder,

  mustBe: mustBe,

  mustHave: mustHave,

  has: has,

  length: has('length'),

  sum: has('sum'),

  more<A>(n : A) {
    return mustBe(`more than ${n}`, 'more')
  },

  less<A>(n : A) {
    return mustBe(`less than ${n}`, 'less')
  },

  atLeast<A>(lb : A) {
    return mustBe(`at least ${lb}`, 'atLeast')
  },

  between<A>(lb : A, ub : A) {
    return mustBe(`between ${lb} and ${ub}`, 'between')
  },

  atMost<A>(ub : A) {
    return mustBe(`at most ${ub}`, 'atMost')
  },

  oneOf<A>(choices : A[]) {
    return mustBe(
      choices.length === 1
        ? `${choices[0]}`
        : `one of ${joinWithCommas(choices.map(x => `${x}`), 'or')}`,
      'oneOf'
    )
  },

  exactly<A>(target : A) {
    return mustBe(`${target}`, 'exactly')
  },

  keys(keys : string[]) : IR<English> {
    const showKeys = keys.length === 1
      ? ` ${keys[0]}`
      : `s ${joinWithCommas(keys, 'and')}`
    return not(mustHave(`unexpected key${showKeys}`, 'keys'))
  },

  bool: deepMerge([mustBe('true'), mustBe('false')]),

  email: a('valid email address', 'email'),

  alphanum: mustHave('letters and numbers only', 'alphanum'),

  uuid: a('valid uuid', 'uuid'),

  url: a('valid URL', 'url'),

  even: mustBe('even'),

  odd: mustBe('odd'),

  empty: mustBe('empty'),

  date: a('date'),

  iterable: mustBe('iterable'),

  array: an('array'),

  set: a('set', 'set'),

  map: a('map'),

  string: a('string'),

  number: a('number'),

  integer: a('whole number', 'integer'),

  object: an('object'),

  leftOut: mustBe('left out'),

  json: a('valid JSON object', 'json'),
}

export function groupByArticle(words : English[]) : { [key in English['article_']]?: English[] } {
  const result : { [key in English['article_']]?: English[] } = {}
  for (const w of words) {
    result[w.article_] = push(w, result[w.article_] || [])
  }
  return result
}

export function renderEnglishAtom<O>(
  nouns : English[],
  props : RenderingOptions<English, O>
) : O {
  let firstArticle = true
  return props.or(
    nouns.filter(x => x.k === 'noun_').map(n => {
      if (n.article_ && firstArticle) {
        firstArticle = false
        return props.words([
          props.fromstr(n.article_),
          props.noun(n.noun_, n.name_, n.article_)
        ])
      }
      return props.noun(n.noun_, n.name_, n.article_)
    })
  )
}

export const enUSOptions : RenderingOptions<English, string> = {
  fromstr: id,
  or: (words : string[]) => joinWithCommas(words, 'or'),
  and: (words : string[]) => joinWithCommas(words, 'and'),
  when: (conseq : string, cond : string) => `${conseq} when ${cond}`,
  elem: (path : (string | number)[]) => `element #${path.map(x => isNumber(x) ? (x as number) + 1 : x).join('.')}`,
  path: (path : string[]) => path.join('.'),
  noun: id,
  atom: renderEnglishAtom,
  words,
  finalize: capFirst,
  pathAtKey: (path, verb, byKey) => {
    return words(byKey ? [verb] : [path, verb])
  }
}

export const enUS = {
  renderer: mkRenderer<English, string>(enUSOptions),
  builder: englishBuilder,
}
