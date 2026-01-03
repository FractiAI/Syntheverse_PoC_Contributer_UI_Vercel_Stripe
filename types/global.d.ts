// Global type declarations to prevent TypeScript build errors
// This file helps TypeScript resolve types for packages that provide their own types

// Suppress implicit type library inclusion for minimatch
// minimatch provides its own types via its package.json "types" field
// This declaration tells TypeScript to use minimatch's built-in types
declare module 'minimatch' {
  export function minimatch(target: string, pattern: string, options?: any): boolean;
  export class Minimatch {
    constructor(pattern: string, options?: any);
    match(target: string): boolean;
    makeRe(): RegExp | false;
    static defaults(def: any): any;
  }
  export default minimatch;
}
