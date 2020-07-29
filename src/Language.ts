declare module 'bueno/locale' {


  // Eslint wants to replace with with
  // export type MessageBuilder<IR> = MessageBuilderBase<IR>
  // which it thinks is equivalent, but isn't when you take
  // declaration merging into account.

  // eslint-disable-next-line
  export interface MessageBuilder<IR> extends MessageBuilderBase<IR> {
  }

  export type VerbBuilder =
    (s : any) => any[];

  export interface MessageBuilderBase<IR> {
    not(ir : IR) : IR;
    either(disj : IR[]) : IR;
    when(conseq : IR, cond : IR[]) : IR;
    at<K extends string>(pfx : K, rs : IR) : IR;
    atEvery(rs : IR) : IR;
    fromString(s : string) : IR;
    verb(
      is : VerbBuilder,
      not : VerbBuilder,
      when?: VerbBuilder,
      whenNot?: VerbBuilder,
      passive?: VerbBuilder,
      passiveNot?: VerbBuilder,
    ) : (msgs : string | IR) => IR
  }

  export type GroupedByKey<Output> =
    | { [key in string]: GroupedByKey<Output> }
    | Output

  export type Paths<Out> = [string, Out][]

  export type MessageRenderer<IR, Output = string> = MessageRendererBase<IR, Output>

  export interface MessageRendererBase<IR, Output = string> {
    render(ir : IR, paths : [string, Output][]) : Output;
    byKey(ir : IR, paths : [string, Output][]) : GroupedByKey<Output>
  }

  export interface Language<IR, Out = string> {
    renderer : MessageRenderer<IR, Out>
    builder : MessageBuilder<IR>
  }

  export type Message =
    <IR>(l : MessageBuilder<IR>) => IR

  export type Err = {
    k : 'v' | 'p',
    m : Message,
    ok : boolean
  }
}
