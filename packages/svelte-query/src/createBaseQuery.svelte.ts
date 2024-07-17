import { notifyManager } from '@tanstack/query-core'
import { untrack } from 'svelte'
import { useIsRestoring } from './useIsRestoring'
import { useQueryClient } from './useQueryClient'
import type { CreateBaseQueryOptions, CreateBaseQueryResult } from './types'
import type {
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverResult,
} from '@tanstack/query-core'

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
  const optionsStore = typeof options !== 'function' ? () => options : options

  /** Creates a store that has the default options applied */
  function updateOptions() {
    const key = optionsStore().queryKey
    const keyFn = typeof key === 'function' ? key : () => key //alow query-key and enable to be a function
    const queryKey = JSON.parse(
      JSON.stringify(keyFn() ?? '') ?? JSON.stringify({}),
    ) // remove proxy

    const defaultedOptions = client.defaultQueryOptions({
      ...optionsStore(),
      queryKey: queryKey, // prevent reactive query  in devTools,
      enabled:
        typeof optionsStore().enabled == 'function'
          ? //@ts-expect-error
            optionsStore().enabled()
          : optionsStore().enabled,
    })
    defaultedOptions._optimisticResults = 'optimistic'
    if (isRestoring()) {
      defaultedOptions._optimisticResults = 'isRestoring'
    }

    defaultedOptions.structuralSharing = false
    // console.log('default option update', defaultedOptions)

    return defaultedOptions
  }

  const defaultedOptionsStore = updateOptions
  /** Creates the observer */
  const observer = new Observer<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >(client, defaultedOptionsStore())

  const result = $state<QueryObserverResult<TData, TError>>(
    observer.getOptimisticResult(defaultedOptionsStore()),
  )

  function upResult(r: QueryObserverResult<TData, TError>) {
    Object.assign(result, r)
  }

  $effect(() => {
    let un = () => undefined
    if (!isRestoring()) {
      {
        //@ts-expect-error
        un = observer.subscribe((v) => {
          console.log('subscribed result', v.data)
          notifyManager.batchCalls(() => {
            const temp = observer.getOptimisticResult(defaultedOptionsStore())
            upResult(temp)
          })()
        })
      }
    }

    observer.updateResult()
    return () => {
      un()
    }
  })

  /** Subscribe to changes in result and defaultedOptionsStore */
  $effect.pre(() => {
    observer.setOptions(defaultedOptionsStore(), { listeners: false })
    //console.log('batch:calling $effect subscribe observer', isRestoring())
    upResult(observer.getOptimisticResult(defaultedOptionsStore()))
    //   result = observer.getOptimisticResult(defaultedOptionsStore()) //prevent lag , somehow observer.subscribe does not return
    // console.log('option updated', defaultedOptionsStore())
  })

  const final_ = $state({ value: result })

  //update result
  $effect(() => {
    // svelte does not need this with it is proxy state and fine-grained reactivity?
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (result !== null)
      untrack(() => {
        const v = !defaultedOptionsStore().notifyOnChangeProps
          ? observer.trackResult(result)
          : result

        final_.value = Object.assign(final_.value, v)
        //console.log('result effect', final_.value.data)
      })
  })
  return final_.value
}
