import { createQuery } from '@tanstack/svelte-query'
export function useSvelteExtensionQuery(props) {
  const enabled = $derived({
    queryKey: ['sv-externel', props],
    queryFn: () => {
      return Date.now()
    },
    enabled: () => props.paginate.page > 0,
  })
  return createQuery(enabled)
}
