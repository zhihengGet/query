<script lang="ts">
	import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools/dev';
	import Simple from './test.svelte';

	const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
	<main>
		<Simple>
			<div let:prop>children{prop}</div>
		</Simple>
	</main>
	<SvelteQueryDevtools />
</QueryClientProvider>
