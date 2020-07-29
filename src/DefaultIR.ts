import { deepMerge, mapValues, mapEntries, assignPath, byEmpty, isString, isEmpty, keys, fromEntries, isNumber } from './utils'
import { joinPath, defaultRenderPath } from './path'
import { GroupedByKey, MessageRenderer } from 'bueno/locale'
import { Paths } from 'bueno/locale'
import { VerbBuilder } from 'bueno/locale'

type VerbVariant = {
  pos_ : VerbBuilder,
  neg_ : VerbBuilder
}

export type Verb<A> = {
  shouldBe_ : VerbVariant,
  when_ : VerbVariant,
  passive_ : VerbVariant,
  irIs_ : A[],
  irIsNot_ : A[],
}

export type Message<Atom> = {
  k : 'msg',
  disj_ : {
    [byPath in string]: {
      verbs_ : { [byVerb in string]: Verb<Atom> }
    }
  }
}

function msg<A>(disj_ : Message<A>['disj_']) : Message<A> {
  return { k: 'msg' as const, disj_ }
}

type Implication<Atom> = {
  k : 'when',
  cond : IR<Atom>[],
  conseq : IR<Atom>
}

export type IR<Atom> =
  Message<Atom> | Implication<Atom>


export function pickVerb(
  group : Verb<any>,
  path : string,
  inWhen : boolean,
  negated : boolean
) : VerbBuilder {
  if (inWhen) {
    if (path) {
      return negated ? group.when_.neg_ : group.when_.pos_
    }
    return negated ? group.passive_.neg_ : group.passive_.pos_
  }
  return negated ? group.shouldBe_.neg_ : group.shouldBe_.pos_
}

export type RenderingOptions<A, Out> = {
  fromstr : (s : string) => Out,
  or : (words : Out[]) => Out,
  and : (words : Out[]) => Out,
  noun : (noun : string, name : string, type : string) => Out,
  when : (conseq : Out, cond : Out) => Out,
  elem : (path : (string | number)[]) => Out,
  path : (path : string[]) => Out,
  atom : (ir : A[], props : RenderingOptions<A, Out>) => Out,
  words : (o : Out[]) => Out,
  pathAtKey : (
    path : Out,
    verb : Out,
    byKey : boolean
  ) => Out,
  finalize : (o : Out) => Out
}

export type Context = {
  atPath : string | null
}

export function mkRenderer<A, Out>(
  props : RenderingOptions<A, Out>
) : MessageRenderer<IR<A>, Out> {
  function renderWhen(
    cond : IR<A>[],
    conseq : IR<A>,
    paths : Paths<Out>,
    context : Context
  ) : Out {
    if (isEmpty(cond)) {
      return clause(conseq, false, paths, context)
    }
    const conds = cond.map(ir => clause(ir, true, paths, { atPath: null }))
    return props.when(clause(conseq, false, paths, context), props.and(conds))
  }

  function renderPath(pth : string, paths : Paths<Out>) : Out {
    return defaultRenderPath(paths, pth.split('.'), function(pth : (string | number)[]) : Out {
      if (pth.some(isNumber)) {
        return props.elem(pth)
      }
      return props.path(pth as string[])
    })
  }

  function clause(
    ir : IR<A>,
    inWhen : boolean,
    paths : Paths<Out>,
    context : Context
  ) : Out {
    if (ir.k === 'when') {
      return renderWhen(ir.cond, ir.conseq, paths, context)
    }
    else {
      const clauses : Out[][] = []
      keys(ir.disj_).sort(byEmpty).forEach(path => {
        const byPath = ir.disj_[path]
        const verbs = byPath.verbs_
        keys(verbs).forEach(verb => {
          const group = verbs[verb];
          const checks = [group.irIs_, group.irIsNot_]
          checks.forEach((xs, i) => {
            if (isEmpty(xs)) return
            const pth =
              renderPath(path, paths)

            const verb =
              pickVerb(group, path, inWhen, i !== 0)

            const words =
              verb(props.atom(xs, props)).map(x => isString(x)
                ? props.fromstr(x as string)
                : x as Out
              )

            const hasPath =
              path === context.atPath

            clauses.push([
              props.pathAtKey(pth, props.words(words), hasPath)
            ])
          })
        })
      })
      return props.or(clauses.map(props.words));
    }
  }

  function render(
    input : IR<A>,
    paths : Paths<Out>,
    context : Context = { atPath: null }
  ) : Out {
    return props.finalize(clause(input, false, paths, context))
  }

  function relevantKeys(ir : IR<A>) : string[] {
    if (ir.k === 'msg') {
      return keys(ir.disj_)
    } else {
      return relevantKeys(ir.conseq)
    }
  }

  function onlyPath(ir : IR<A>, path : string) : IR<A> {
    if (ir.k === 'msg') {
      if (ir.disj_[path]) {
        return msg({ [path]: ir.disj_[path] })
      }
      return ir
    }
    return buildWhen(
      onlyPath(ir.conseq, path),
      ir.cond.map(x => onlyPath(x, path)),
    )
  }

  function byKey(ir : IR<A>, paths : Paths<Out>) : GroupedByKey<Out> {
    if (ir.k === 'msg') {
      const result : GroupedByKey<Out> = {}
      keys(ir.disj_).map(path => {
        const segments = path.split('.')
        const disj : IR<A>[] = keys(ir.disj_)
          .filter(key => key !== path)
          .map(key =>
            not(msg({ [key]: (ir.disj_[key]) })))

        const context = { atPath: path }

        const conseq : IR<A> =
          onlyPath(ir, path)

        assignPath(result, segments, props.finalize(renderWhen(disj, conseq, paths, context)))
      })
      return result
    } else {
      return fromEntries(
        relevantKeys(ir.conseq).map(path => {
          return [
            path,
            render(ir, paths, { atPath: path })
          ] as [string, Out]
        }).concat([['', render(ir, paths, { atPath: null })]])
      )
    }
  }
  return {
    render,
    byKey,
  }
}

function mapVerbs<A>(
  f : (inp : Message<A>['disj_']['']) => Message<A>['disj_']['']
) : (ir : IR<A>) => IR<A> {
  const mapper = (ir : IR<A>) : IR<A> => {
    if (ir.k == 'msg') {
      return msg(mapValues(ir.disj_, f))
    }
    else {
      return buildWhen(
        mapper(ir.conseq),
        ir.cond.map(mapper)
      )
    }
  }
  return mapper
}

function adapt(f : string | VerbBuilder) : VerbBuilder {
  if (isString(f)) {
    return x => [f as string, x]
  }
  return f as VerbBuilder
}

export function createVerb<A>(
  is : VerbBuilder,
  not : VerbBuilder,
  when : VerbBuilder,
  whenNot : VerbBuilder,
  passive : VerbBuilder,
  passiveNot : VerbBuilder,
) : Verb<A> {
  return {
    shouldBe_: { pos_: is, neg_: not },
    when_: { pos_: when, neg_: whenNot },
    passive_: { pos_: passive, neg_: passiveNot },
    irIs_: [],
    irIsNot_: [],
  }
}

export function setVerb<A>(verb : Verb<A>) : (ir : IR<A>) => IR<A> {
  return mapVerbs((byPath => {
    const fn = (_key : string | number | symbol, y : Verb<A>) : [string | number | symbol, Verb<A>] => {
      const name =
        verb.shouldBe_.pos_('').join('')
      return [
        name,
        { ...verb, irIs_: y.irIs_, irIsNot_: y.irIsNot_ }
      ]
    }
    return ({
      verbs_: mapEntries(byPath.verbs_, fn)
    })
  }))
}

const n : VerbBuilder =
  x => [x]

const noVerb =
  createVerb<any>(n, n, n, n, n, n)

export function atom<A>(atom : A) : IR<A> {
  return msg({
    '': { verbs_: { '': { ...noVerb, irIs_: [atom] } } }
  })
}

function fromString(noun_ : string, name_ : string = noun_) : IR<any> {
  return atom({ article_: '', noun_, k: 'noun_', name_ })
}

function buildWhen<A>(conseq : IR<A>, cond : IR<A>[]) : IR<A> {
  return {
    k: 'when',
    cond,
    conseq
  }
}

export function not<A>(conj : IR<A>) : IR<A> {
  if (conj.k === 'msg') {
    const a = conj.disj_
    return {
      k: 'msg',
      disj_: mapValues(a, v => {
        return ({
          verbs_: mapValues(v.verbs_, x => ({
            ...x,
            irIs_: x.irIsNot_,
            irIsNot_: x.irIs_
          }))
        })
      })
    } as IR<A>
  } else {
    return buildWhen(not(conj.conseq), conj.cond)
  }
}

export function at<A, K extends string>(pfx : K, r : IR<A>) : IR<A> {
  function atGroup(r : Message<A>['disj_']) {
    const result : any = {}
    keys(r).forEach(key => {
      result[joinPath(pfx, key)] = (r as any)[key]
    })
    return result as any
  }
  if (r.k === 'msg') {
    return msg(atGroup(r.disj_))
  } else {
    return buildWhen(
      at(pfx, r.conseq),
      r.cond.map(c => at(pfx, c))
    )
  }
}

export function verb<A>(
  is : VerbBuilder | string,
  not : VerbBuilder | string,
  when : VerbBuilder | string = is,
  whenNot : VerbBuilder | string = not,
  passive : VerbBuilder | string = when,
  passiveNot : VerbBuilder | string = whenNot,
) : (msgs : string | IR<A>, name?: string) => IR<A> {
  const setv =
    setVerb(
      createVerb<A>(
        adapt(is),
        adapt(not),
        adapt(when),
        adapt(whenNot),
        adapt(passive),
        adapt(passiveNot)
      )
    )

  return (x : string | IR<A>, name?: string) =>
    setv(
      isString(x)
        ? fromString(x as string, name || x as string) as IR<A>
        : (x as IR<A>)
    );
}

export const defaultBuilder = {

  not,

  either: deepMerge,

  when: buildWhen,

  at,

  fromString,

  atEvery<A>(rs : IR<A>) : IR<A> {
    return at('every element', rs)
  },

  verb
}
