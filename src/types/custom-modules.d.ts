declare module 'pixelmatch';
declare module 'pngjs';

// PNGJS exports PNG and PNG.sync that we use in tests — keep it flexible for now.
declare module 'pngjs' {
  export class PNG {
    constructor(_opts?: any);
    width: number;
    height: number;
  }
}

export { };