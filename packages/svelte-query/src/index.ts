/* istanbul ignore file */

import { QueryClient } from '@tanstack/query-core'
import { Snippet } from 'svelte'
import { useIsRestoring } from './../../solid-query/src/isRestoring'

// Re-export core
export * from '@tanstack/query-core'

// Svelte Query
export * from './types'
export * from './context'

export { createQuery } from './createQuery'
export type {
  DefinedInitialDataOptions,
  UndefinedInitialDataOptions,
} from './queryOptions'
export { queryOptions } from './queryOptions'
export { createQueries } from './createQueries.svelte'
export { createInfiniteQuery } from './createInfiniteQuery'
export { infiniteQueryOptions } from './infiniteQueryOptions'
export { createMutation } from './createMutation.svelte'
export { useQueryClient } from './useQueryClient'
export { useIsFetching } from './useIsFetching.svelte'
export { useIsMutating } from './useIsMutating.svelte'
export { useIsRestoring } from './useIsRestoring'
export { useHydrate } from './useHydrate'

export { default as HydrationBoundary } from './HydrationBoundary.svelte'
export { default as QueryClientProvider } from './QueryClientProvider.svelte'
export type QueryClientProviderProps = {
  client: QueryClient
  children?: Snippet
}
