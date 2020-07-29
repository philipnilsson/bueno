import { joinWithCommas, words, capFirst, id, isNumber, deepMerge } from '../utils';
import { IR, mkRenderer, verb, atom, defaultBuilder, not, at, RenderingOptions } from '../DefaultIR'
import { MessageBuilder } from 'bueno/locale';

export type Spanish =
  | { k : 'noun_', article_ : '' | 'un' | 'una', noun_ : string, name_ : string }

const debeSer =
  verb<any>('debe ser', 'no debe ser', 'es', 'no es', '', 'no')

const debeEstar =
  verb<any>('debe estar', 'no debe estar', 'está', 'no está', '', 'no')

const mustHave =
  verb<any>('debe tener', 'no debe tener', 'tiene', 'no tiene', '', 'no')

function un(noun_ : string, name_ : string) : IR<Spanish> {
  return debeSer(atom({ article_: 'un', noun_, k: 'noun_', name_ }))
}

function una(noun_ : string, name_ : string) : IR<Spanish> {
  return debeSer(atom({ article_: 'una', noun_, k: 'noun_', name_ }))
}

function tener(name : string) : (ir : IR<Spanish>) => IR<Spanish> {
  return verb(
    `debe tener ${name}`,
    `no debe tener ${name}`,
    `tiene ${name}`,
    `no tiene ${name}`,
  )
}

const spanishBuilder : MessageBuilder<IR<Spanish>> = {

  ...defaultBuilder,

  mustBe: debeSer,

  mustHave,

  has: tener,

  length: tener('una longitud de'),

  sum: tener('una suma de'),

  atEvery(ir : IR<Spanish>) : IR<Spanish> {
    return at('cada elemento', ir)
  },

  more<A>(n : A) {
    return debeSer(`más que ${n}`, 'more');
  },

  less<A>(n : A) {
    return debeSer(`menor que ${n}`, 'less');
  },

  atLeast<A>(lb : A) {
    return debeSer(`al menos ${lb}`, 'atLeast')
  },

  between<A>(lb : A, ub : A) {
    return debeEstar(`entre ${lb} y ${ub}`, 'between')
  },

  atMost<A>(ub : A) {
    return debeSer(`como máximo ${ub}`, 'atMost')
  },

  oneOf<A>(choices : A[]) {
    if (choices.length === 1) {
      return debeSer(`${choices[0]}`, 'oneOf')
    }
    return debeSer(
      `uno de ${joinWithCommas(choices.map(x => `${x}`), 'o')}`,
      'oneOf'
    )
  },

  exactly<A>(target : A) {
    return debeSer(`${target}`, 'exactly')
  },

  keys(keys : string[]) {
    const showKeys = keys.length === 1
      ? `llave inesperada ${keys[0]}`
      : `llaves inesperadas ${joinWithCommas(keys, 'y')}`
    return not(mustHave(showKeys, 'keys'))
  },

  email: un('correo electrónico válido', 'email'),

  alphanum: debeSer('solo números y letras', 'alphanum'),

  uuid: un('UUID', 'uuid'),

  url: una('URL valida', 'url'),

  even: debeSer('parejo', 'even'),

  odd: debeSer('impar', 'odd'),

  empty: debeEstar('vacío', 'empty'),

  date: debeSer('una fecha', 'date'),

  iterable: debeSer('iterable', 'iterable'),

  array: una('lista', 'array'),

  string: un('texto', 'string'),

  set: un('conjunto', 'set'),

  map: una('asociación', 'map'),

  bool: deepMerge([debeSer('cierto'), debeSer('falso')]),

  number: un('número', 'number'),

  integer: un('número entero', 'integer'),

  object: un('objeto', 'object'),

  leftOut: debeSer('omitido'),

  json: un('objeto json válido', 'json')
}

function renderSpanishAtom<Out>(
  nouns : Spanish[],
  props : RenderingOptions<Spanish, Out>
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

export const esESOptions : RenderingOptions<Spanish, string> = {
  fromstr: id,
  or: (words : string[]) => joinWithCommas(words, 'o'),
  and: (words : string[]) => joinWithCommas(words, 'y'),
  when: (conseq : string, cond : string) => `${conseq} cuando ${cond}`,
  elem: (path : (string | number)[]) => `elemento número #${path.map(x => isNumber(x) ? (x as number) + 1 : x).join('.')}`,
  path: (path : string[]) => path.join('.'),
  noun: id,
  atom: renderSpanishAtom,
  words,
  finalize: capFirst,
  pathAtKey: (path, verb, byKey) => {
    return words(byKey ? [verb] : [path, verb])
  }
}

export const esES = {
  renderer: mkRenderer<Spanish, string>(esESOptions),
  builder: spanishBuilder,
}
