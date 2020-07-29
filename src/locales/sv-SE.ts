import { joinWithCommas, words, capFirst, id, isNumber, deepMerge } from '../utils';
import { IR, mkRenderer, verb, atom, defaultBuilder, not, at, RenderingOptions } from '../DefaultIR'
import { MessageBuilder } from 'bueno/locale';

export type Swedish =
  | { k : 'noun_', article_ : '' | 'en' | 'ett', noun_ : string, name_ : string }

const skallVara =
  verb<any>('måste vara', 'får inte vara', 'är', 'inte är', '', 'inte')

const skallHa =
  verb<any>('måste ha', 'får inte ha', 'har', 'inte har', '', 'inte')

function en(noun_ : string, name_ : string) {
  return skallVara(atom({ article_: 'en', noun_, k: 'noun_', name_ }))
}

function ett(noun_ : string, name_ : string) {
  return skallVara(atom({ article_: 'ett', noun_, k: 'noun_', name_ }))
}

function has(name : string) : (ir : IR<Swedish>) => IR<Swedish> {
  return verb(
    `måste ha ${name}`,
    `får inte ha ${name}`,
    `${name}`,
    `inte ${name}`
  )
}

const swedishBuilder = {

  ...defaultBuilder,

  mustBe: skallVara,

  mustHave: skallHa,

  has,

  length: has('längd'),

  sum: has('summa'),

  atEvery(ir : IR<Swedish>) : IR<Swedish> {
    return at('varje element', ir)
  },

  more<A>(n : A) {
    return skallVara(`mer än ${n}`, 'more');
  },

  less<A>(n : A) {
    return skallVara(`mindre än ${n}`, 'less');
  },

  atLeast<A>(lb : A) {
    return skallVara(`som minst ${lb}`, 'atLeast')
  },

  between<A>(lb : A, ub : A) {
    return skallVara(`mellan ${lb} och ${ub}`, 'between')
  },

  atMost<A>(ub : A) {
    return skallVara(`som mest ${ub}`, 'atMost')
  },

  oneOf<A>(choices : A[]) {
    if (choices.length === 1) {
      return skallVara(`${choices[0]}`, 'oneOf')
    }
    return skallVara(
      `en av ${joinWithCommas(choices.map(x => `${x}`), 'eller')}`,
      'oneOf'
    )
  },

  exactly<A>(target : A) {
    return skallVara(`${target}`, 'exactly')
  },

  keys(keys : string[]) {
    const showKeys = keys.length === 1
      ? `oväntad nyckel ${keys[0]}`
      : `oväntade nycklar ${joinWithCommas(keys, 'och')}`
    return not(skallHa(showKeys, 'keys'))
  },

  email: en('giltig e-postaddress', 'email'),

  alphanum: skallHa('endast bokstäver och siffror', 'alphanum'),

  uuid: en('giltig uuid', 'uuid'),

  url: en('giltig webbaddress', 'url'),

  even: skallVara('jämnt', 'even'),

  odd: skallVara('udda', 'odd'),

  empty: skallVara('tom', 'empty'),

  date: skallVara('datum', 'date'),

  iterable: skallVara('itererbar', 'iterable'),

  array: en('lista', 'array'),

  string: en('text', 'string'),

  set: en('mängd', 'set'),

  map: en('association', 'map'),

  bool: deepMerge([skallVara('sant'), skallVara('falskt')]),

  number: ett('tal', 'number'),

  integer: ett('heltal', 'integer'),

  object: ett('objekt', 'object'),

  leftOut: skallVara('utlämnad'),

  json: ett('giltigt JSON-objekt', 'json')
}

function renderSwedishAtom<Out>(
  nouns : Swedish[],
  props : RenderingOptions<Swedish, Out>
) : Out {
  let lastArticle = '';
  const ns : Out[] = nouns.filter(x => x.k === 'noun_').map(n => {
    if (n.article_ && (n.article_ !== lastArticle)) {
      lastArticle = n.article_
      return props.words([
        props.fromstr(n.article_),
        props.noun(n.noun_, n.name_, n.article_)
      ])
    }
    return props.noun(n.noun_, n.name_, n.article_)
  })
  return props.or(ns)
}

export const svSEOptions : RenderingOptions<Swedish, string> = {
  fromstr: id,
  or: (words : string[]) => joinWithCommas(words, 'eller'),
  and: (words : string[]) => joinWithCommas(words, 'och'),
  when: (conseq : string, cond : string) => `${conseq} när ${cond}`,
  elem: (path : (string | number)[]) => `element #${path.map(x => isNumber(x) ? (x as number) + 1 : x).join('.')}`,
  path: (path : string[]) => path.join('.'),
  noun: id,
  atom: renderSwedishAtom,
  words,
  finalize: capFirst,
  pathAtKey: (path, verb, byKey) => {
    return words(byKey ? [verb] : [path, verb])
  }
}

export const svSE = {
  renderer: mkRenderer<Swedish, string>(svSEOptions),
  builder: swedishBuilder,
}
