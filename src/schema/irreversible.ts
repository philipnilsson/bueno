import { constant } from "../utils";

export let irreversible : (name : string) => () => any;

if (IS_DEV) {
  irreversible = function(func : string) {
    return () => {
      throw new Error(`Schema irreversible as ${func} was used with a single argument.`)
    }
  }
}
else {
  irreversible = constant(undefined as any)
}
