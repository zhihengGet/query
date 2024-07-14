import {
  Mutation,
  MutationCache,
  type MutationFilters,
  MutationState,
  type QueryClient,
  replaceEqualDeep,
} from '@tanstack/query-core'
import { useQueryClient } from './useQueryClient'

export type MutationStateOptions<TResult = MutationState> = {
  filters?: MutationFilters
  select?: (mutation: Mutation) => TResult
}

function getResult<TResult = MutationState>(
  mutationCache: MutationCache,
  options: MutationStateOptions<TResult>,
): Array<TResult> {
  return mutationCache
    .findAll(options.filters)
    .map(
      (mutation): TResult =>
        (options.select ? options.select(mutation) : mutation.state) as TResult,
    )
}

export function useMutationState<TResult = MutationState>(
  options: MutationStateOptions<TResult> = {},
  queryClient?: QueryClient,
): Array<TResult> {
  const mutationCache = useQueryClient(queryClient).getMutationCache()
  const result = $state(getResult(mutationCache, options))

  $effect(() => {
    const unsubscribe = mutationCache.subscribe(() => {
      const nextResult = replaceEqualDeep(
        result,
        getResult(mutationCache, options),
      )
      if (result !== nextResult) {
        Object.assign(result, nextResult)
      }
    })

    return unsubscribe
  })

  /*  $effect(() => {
    mutationCache.subscribe(() => {
      const nextResult = replaceEqualDeep(
        result.current,
        getResult(mutationCache, optionsRef),
      )
      if (result.current !== nextResult) {
        result = nextResult
        //notifyManager.schedule(onStoreChange)
      }
    })
  }) */
  return result
}
