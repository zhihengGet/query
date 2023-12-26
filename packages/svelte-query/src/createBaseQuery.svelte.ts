import { notifyManager } from '@tanstack/query-core'
import { useIsRestoring } from './useIsRestoring'
import { useQueryClient } from './useQueryClient'
import type {
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverResult,
} from '@tanstack/query-core'
import type { CreateBaseQueryOptions, CreateBaseQueryResult } from './types'

export function createBaseQuery<
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey,
>(
  options: CreateBaseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >,
  Observer: typeof QueryObserver,
  queryClient?: QueryClient,
): CreateBaseQueryResult<TData, TError> {
  /** Load query client */
  const client = useQueryClient(queryClient)
  let isRestoring = useIsRestoring()
  /** Converts options to a svelte store if not already a store object */
  const optionsStore = options

  /** Creates a store that has the default options applied */
  function op() {
    const defaultedOptions = client.defaultQueryOptions(optionsStore)
    defaultedOptions._optimisticResults == isRestoring
      ? 'isRestoring'
      : 'optimistic'
    return defaultedOptions
  }
  const defaultedOptionsStore = $derived(op())
  /** Creates the observer */
  const observer = $derived(
    new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(
      client,
      defaultedOptionsStore,
    ),
  )
  // Do not notify on updates because of changes in the options because
  // these changes should already be reflected in the optimistic result
  $effect(() => {
    observer.setOptions(defaultedOptionsStore, { listeners: false })
  })

  let result = $state<QueryObserverResult<TData, TError>>()
  $effect(() => {
    let un = () => undefined

    if (!isRestoring) {
      {
        un = observer.subscribe((r) => {
          notifyManager.batchCalls(() => {
            isRestoring = true
          })()
          result = r
        })
      }
    }

    observer.updateResult()
    return un
  })

  /** Subscribe to changes in result and defaultedOptionsStore */

  const opt = $derived(
    (() => {
      result = observer.getOptimisticResult(defaultedOptionsStore)
      return !defaultedOptionsStore.notifyOnChangeProps
        ? observer.trackResult(result)
        : result
    })(),
  )
  console.log('hi')
  return () => opt
}
