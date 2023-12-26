import { derived, get, readable } from 'svelte/store'
import { MutationObserver, notifyManager } from '@tanstack/query-core'
import { useQueryClient } from './useQueryClient'
import type {
  CreateMutateFunction,
  CreateMutationOptions,
  CreateMutationResult,
} from './types'
import type { DefaultError, QueryClient } from '@tanstack/query-core'

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

  const optionsStore = $derived(options)

  const observer = $derived(
    new MutationObserver<TData, TError, TVariables, TContext>(
      client,
      optionsStore,
    ),
  )
  let mutate: CreateMutateFunction<TData, TError, TVariables, TContext> =
    $state()

  $effect(() => {
    mutate = (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop)
    }
    observer.setOptions(options)
  })

  let result = observer.getCurrentResult()
  $effect(() =>
    observer.subscribe((val) => {
      notifyManager.batchCalls(() => {
        result = val
      })()
    }),
  )

  const data = $derived({
    ...result,
    mutate,
    mutateAsync: result.mutate,
  })

  return data
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
