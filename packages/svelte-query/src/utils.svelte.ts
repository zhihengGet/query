export function createMemo<T>(fn: () => T) {
  const data = $derived(fn())
  return data
}
export function derive<T>(fn: T) {
  const data = $derived(fn())
  return () => data
}
