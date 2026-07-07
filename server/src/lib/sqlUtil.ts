/** Escape LIKE wildcards so user input matches literally (used with ESCAPE '\'). */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** "?, ?, ?" for n bound parameters. */
export function placeholders(n: number): string {
  return Array(n).fill('?').join(', ');
}
