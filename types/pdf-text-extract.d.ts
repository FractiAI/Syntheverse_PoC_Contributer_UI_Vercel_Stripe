// Type declarations for pdf-text-extract
declare module 'pdf-text-extract' {
  function extract(
    buffer: Buffer,
    callback: (error: Error | null, pages: string[]) => void
  ): void

  export = extract
}
