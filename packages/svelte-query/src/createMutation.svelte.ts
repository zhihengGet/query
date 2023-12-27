import { derived, get, readable } from 'svelte/store'
import { MutationObserver, notifyManager } from '@tanstack/query-core'
import { useQueryClient } from './useQueryClient'
import type {
  CreateMutateFunction,
  CreateMutationOptions,
  CreateMutationResult,
} from './types'
import type { DefaultError, QueryClient } from '@tanstack/query-core'
import { onDestroy } from 'svelte'

export function createMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: CreateMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
): CreateMutationResult<TData, TError, TVariables, TContext> {
  const client = useQueryClient(queryClient)

  const observer = $derived(
    new MutationObserver<TData, TError, TVariables, TContext>(client, options),
  )
  const mutate = $state<
    CreateMutateFunction<TData, TError, TVariables, TContext>
  >((variables, mutateOptions) => {
    observer.mutate(variables, mutateOptions).catch(noop)
  })

  $effect.pre(() => {
    observer.setOptions(options)
  })

  let result = observer.getCurrentResult()

  const un = observer.subscribe((val) => {
    notifyManager.batchCalls(() => {
      result = val
    })()
  })
  onDestroy(un)

  const data = $state({
    ...result,
    mutate,
    mutateAsync: result.mutate,
  })
  $effect(() => {
    Object.assign(data, {
      ...result,
      mutate,
      mutateAsync: result.mutate,
    })
  })
  return data
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
