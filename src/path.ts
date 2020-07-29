import { Language } from 'bueno/locale'
import { Paths } from 'bueno/locale'
import { isDigits } from './utils'

export function defaultRenderPath<Out>(
  paths : Paths<Out>,
  p : string[],
  renderPath : (path : (string | number)[]) => Out
) : Out {
  return renderOverriddenPath(paths, p) ?? (renderBasePath(p, renderPath))
}

export function renderBasePath<Out>(
  p : string[],
  renderPath : (path : (string | number)[]) => Out
) : Out {
  const segments =
    p.map(s => s.replace(/^_#_/, ''))

  return renderPath(
    segments.map(x => {
      if (isDigits(x)) {
        return Number(x)
      }
      return x
    }))
}

function isAbsolutePath(p : string) : boolean {
  return p.startsWith('_#_')
}

export function joinPath(p : string, q : string) {
  if (p === '') return q
  if (q === '') return p
  if (isAbsolutePath(p)) {
    return p
  }
  if (isAbsolutePath(q)) {
    return q
  }
  return p + '.' + q
}

export function renderOverriddenPath<Out>(
  paths : [string, Out][],
  path : string[]
) : null | Out {
  const exprs : [RegExp, Out][] =
    paths.map(kv => {
      const expr = kv[0]
      const translation = kv[1]
      return [
        new RegExp(
          '^'
          + expr.replace(/\*/g, '\\w*').replace(/\./g, '\\.?')
          + '$'
        ),
        translation
      ]
    })
  const p = path.join('.')
  const c = exprs.find(x => x[0].test(p))
  if (c !== undefined) return c[1]
  return null
}

export function describePaths<IR, O>(
  l : Language<IR, O>,
  dict : Paths<O>
) : Language<IR, O> {
  return {
    builder: l.builder,
    renderer: {
      ...l.renderer,
      byKey(ir : IR, paths : Paths<O>) {
        return l.renderer.byKey(ir, dict.concat(paths))
      },
      render(ir : IR, paths : Paths<O>) {
        return l.renderer.render(ir, dict.concat(paths))
      }
    }
  }
}
