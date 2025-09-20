export type AsyncProvider<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K];
} & (T extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : {});

export interface EchoConfig {
  appId: string;
  basePath?: string;
  baseRouterUrl?: string;
  baseEchoUrl?: string; // control plane url
}
