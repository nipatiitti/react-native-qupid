const Qupid = require('./NativeQupid').default;

export function multiply(a: number, b: number): number {
  return Qupid.multiply(a, b);
}
