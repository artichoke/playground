// Type bindings for Ruby example sources loaded with esbuild text loaders.
declare module "*.rb" {
  const content: string;
  export default content;
}
