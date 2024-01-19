<script lang="ts">
	import {
		createMutation,
		createQuery,
		createQueries,
		useQueryClient
	} from '@tanstack/svelte-query/dev';
	import Test1 from './test1.svelte';

	let { children } = $props();
	function isDerivedReactive() {
		const host = $state({ a: 1 });
		const b = $derived({ a: host });
		const DeriWithHostVal = $derived({ a: host.a });
		const stateWithHostVal = $state({ a: host.a });
		const c = $state({ a: host });
		const d = { a: host };
		return {
			host,
			derivedWithHost: b,
			stateWithHost: c,
			objectWithHost: c,
			updateHost: (v) => {
				host.a += 1;
			}
		} as const;
	}

	export { isDerivedReactive };
	//create query

	let createQueryKey = $state('string props');
	let createQueryKeyDeep = $state(['deep create query props']);

	const stateSample = isDerivedReactive();

	const data = createQuery({
		queryKey: ['1'],
		queryFn: () => fetch('https://pokeapi.co/api/v2/pokemon/ditto?1'),
		refetchOnMount: false
	});
</script>

checking if query is cached , should no fetch again on Remount
<button onclick={stateSample.updateHost}>op {JSON.stringify(stateSample)} </button>

<hr />
<div>
	<h1>Create Query</h1>
	<h2>QueryOptions: Shallow:{createQueryKey}<br /> Deep:{createQueryKeyDeep}</h2>

	<div>Result: {JSON.stringify(data)}</div>
	<hr />
	<div>Data: {JSON.stringify(data.data)}</div>
	<hr />
	<div>isError: {JSON.stringify(data)}</div>
</div>
