export function stat(path: string): Deno.FileInfo | undefined {
  try {
    return Deno.lstatSync(path);
  } catch {
    return undefined;
  }
}
