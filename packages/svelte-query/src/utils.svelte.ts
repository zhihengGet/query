export function createMemo<T>(fn: () => T) {
  return $derived(fn())
}
export function derive<T>(fn: T) {
  return $derived(fn())
}
