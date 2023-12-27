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
  const isRestoring = useIsRestoring()
  const optionsStore = $derived(options)

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
  $effect.pre(() => {
    observer.setOptions(defaultedOptionsStore, { listeners: false })
  })

  let result = $state<QueryObserverResult<TData, TError>>(
    observer.getOptimisticResult(defaultedOptionsStore),
  )
  $effect.pre(() => {
    let un = () => undefined

    if (!isRestoring) {
      {
        un = observer.subscribe(
          notifyManager.batchCalls((v) => {
            result = v
          }),
        )
      }
    }

    observer.updateResult()
    return un
  })

  /** Subscribe to changes in result and defaultedOptionsStore */

  const final_ = $state({ value: {} })
  const final_res = $state({})

  $effect.pre(() => {
    result = observer.getOptimisticResult(defaultedOptionsStore)
  })
  $effect.pre(() => {
    const v = !defaultedOptionsStore.notifyOnChangeProps
      ? observer.trackResult(result)
      : result
    final_.value = v //option 1
    Object.assign(final_res, v) // option 2
    console.log('result', result, defaultedOptionsStore)
  })
  //@ts-expect-error
  return new Proxy(final_, {
    get(target, p) {
      //@ts-expect-error
      return target.value[p]
    },
  })
}
