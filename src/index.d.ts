// Type bindings for Ruby example sources loaded with esbuild text loaders.
declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "*?worker" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const x: any;
  export = x;
}
