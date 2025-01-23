export function testEach<T>(params: Record<string, T>, cb: (p: T) => void) {
  Object.keys(params).map((title) => {
    Deno.test(title, () => {
      cb(params[title]);
    });
  });
}
