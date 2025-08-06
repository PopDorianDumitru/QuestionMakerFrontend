declare module "*.ttf" {

  const src: string;
  export default src;
}

declare module "*.ttf?base64" {
  const src: string;
  export default src;
}

declare module "*.ttf?arraybuffer" {
  const src: ArrayBuffer;
  export default src;
}
