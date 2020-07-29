import { Locale } from "../index";

export const emptyLocale : Locale = {
  builder: { fromString: (x : any) => x, either: (xs : any) => xs[0] } as any,
  renderer: { render: (x : any) => x } as any
}
