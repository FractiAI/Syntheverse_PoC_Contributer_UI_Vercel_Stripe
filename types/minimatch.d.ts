// Type declaration for minimatch to prevent TypeScript build errors
// This is a stub declaration - minimatch types are provided by @types/minimatch
declare module 'minimatch' {
  export function minimatch(target: string, pattern: string, options?: any): boolean;
  export class Minimatch {
    constructor(pattern: string, options?: any);
    match(target: string): boolean;
  }
}

