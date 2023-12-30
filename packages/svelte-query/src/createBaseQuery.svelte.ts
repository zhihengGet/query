import {
  QueryCache,
  notifyManager,
  replaceEqualDeep,
} from '@tanstack/query-core'
import { useIsRestoring } from './useIsRestoring'
import { useQueryClient } from './useQueryClient'
import type {
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverResult,
} from '@tanstack/query-core'
import type { CreateBaseQueryOptions, CreateBaseQueryResult } from './types'
import { flushSync, unstate, untrack } from 'svelte'

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
  const optionsStore = $derived(
    typeof options !== 'function' ? () => options : options,
  )

  /** Creates a store that has the default options applied */
  function op() {
    const defaultedOptions = client.defaultQueryOptions(optionsStore())
    defaultedOptions._optimisticResults == isRestoring
      ? 'isRestoring'
      : 'optimistic'
    defaultedOptions.structuralSharing = false

    return defaultedOptions
  }
  $effect(() => {
    console.log('default store oupted', optionsStore)
  })
  const defaultedOptionsStore = $derived(op())
  /** Creates the observer */
  const observer = $derived(
    new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(
      client,
      defaultedOptionsStore,
    ),
  )

  let result = $state<QueryObserverResult<TData, TError>>(
    observer.getOptimisticResult(defaultedOptionsStore),
  )
  let shoudRender = $state([])
  $effect(() => {
    if (shoudRender)
      untrack(() => {
        Object.assign(
          result,
          observer.getOptimisticResult(unstate(defaultedOptionsStore)),
        )
      })
  })

  $effect(() => {
    let un = () => undefined

    if (!isRestoring) {
      {
        //@ts-expect-error
        un = observer.subscribe((v) => {
          shoudRender = [] // for rerender above statement
        })
      }
    }

    observer.updateResult()
    return un
  })
  $effect.pre(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result
    observer.setOptions(unstate(defaultedOptionsStore), { listeners: false })
  })

  /** Subscribe to changes in result and defaultedOptionsStore */

  const final_ = $state({ value: {} })
  // const final_res = $state({})

  $effect(() => {
    const v = !defaultedOptionsStore.notifyOnChangeProps
      ? observer.trackResult(result)
      : result

    final_.value = Object.assign(final_.value, v)

    //  console.log('result', result, defaultedOptionsStore)
  })
  //@ts-expect-error
  return new Proxy(final_, {
    get(target, p) {
      //console.log('p', p)
      if (p == 'value') {
        return target.value
      }
      //@ts-expect-error
      return target.value[p]
    },
  })
}
