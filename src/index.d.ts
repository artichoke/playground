// Type bindings for Ruby example sources loaded with Webpack asset loaders.
declare module "*.rb" {
  const content: string;
  export default content;
}
