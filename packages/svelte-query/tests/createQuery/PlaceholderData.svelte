<script lang="ts">
  import { untrack } from 'svelte'
  import { createQuery, keepPreviousData } from '../../src/index'
  import { sleep } from '../utils.svelte'
  import type { QueryClient, QueryObserverResult } from '@tanstack/query-core'

  let {
    queryClient,
    states,
  }: {
    queryClient: QueryClient
    states: { value: Array<QueryObserverResult> }
  } = $props()

  let count = $state(0)

  const options = $derived(() => ({
    queryKey: ['test', count],
    queryFn: async () => {
      await sleep(5)
      return count
    },
    placeholderData: keepPreviousData,
  }))

  const query = createQuery(options, queryClient)

  $effect(() => {
    states.value = [...untrack(() => states.value), $state.snapshot(query)]
  })
</script>

<button onclick={() => (count += 1)}>setCount</button>

<div>Status: {query.status}</div>
<div>Data: {query.data ?? 'undefined'}</div>
