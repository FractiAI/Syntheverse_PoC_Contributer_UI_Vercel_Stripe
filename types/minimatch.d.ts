// Type declaration for minimatch to prevent TypeScript build errors
// This provides a minimal type definition to satisfy TypeScript's implicit type library requirement
declare module 'minimatch' {
  export function minimatch(target: string, pattern: string, options?: any): boolean;
  export class Minimatch {
    constructor(pattern: string, options?: any);
    match(target: string): boolean;
  }
  export default minimatch;
}

