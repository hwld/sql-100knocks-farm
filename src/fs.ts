export function fileExists(path: string): boolean {
  try {
    const info = Deno.statSync(path);
    return info.isFile;
  } catch {
    return false;
  }
}
