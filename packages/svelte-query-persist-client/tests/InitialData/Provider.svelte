<script lang="ts">
  import PersistQueryClientProvider from '../../src/PersistQueryClientProvider.svelte'
  import InitialData from './InitialData.svelte'
  import type { OmitKeyof, QueryClient } from '@tanstack/svelte-query'
  import type { PersistQueryClientOptions } from '@tanstack/query-persist-client-core'
  import type { StatusResult } from '../utils.svelte'

  interface Props {
    queryClient: QueryClient
    persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'>
    states: { value: Array<StatusResult<string>> }
  }

  let { queryClient, persistOptions, states }: Props = $props()
</script>

<PersistQueryClientProvider client={queryClient} {persistOptions}>
  <InitialData {states} />
</PersistQueryClientProvider>
