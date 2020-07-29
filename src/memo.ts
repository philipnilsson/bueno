export function memo2<A, C, B>(
  f : (a : A, b : B) => C
) : (a : A, c : B) => C {
  let cc : C
  let ac = {}
  let bc = {}
  return (a : A, b : B) => {
    if (ac !== a || bc !== b) {
      cc = f(a, b)
      ac = a
      bc = b
    }
    return cc
  }
}
