<script lang="ts">
	import {
		createMutation,
		createQuery,
		createQueries,
		useQueryClient
	} from '@tanstack/svelte-query/dev';
	import Test1 from './test1.svelte';
	import { unstate } from 'svelte';

	let { children } = $props();
	function isDerivedReactive() {
		let host = $state({ a: 1 });
		const b = $derived({ a: host });
		const DeriWithHostVal = $derived({ a: host.a });
		const stateWithHostVal = $state({ a: host.a });
		const c = $state({ a: host });
		const d = { a: host };
		return {
			host,
			DeriWithHostVal,
			stateWithHostVal,
			derivedWithHost: b,
			stateWithHost: c,
			objectWithHost: c,
			updateHost: (v) => {
				host.a = v;
			}
		} as const;
	}

	export { isDerivedReactive };
	//create query

	let createQueryKey = $state('string props');
	let createQueryKeyDeep = $state(['deep create query props']);
	let createQueryKeyDeepArr = $state({ test: ['deep create query props'] });

	const stateSample = isDerivedReactive();

	const data = createQuery({
		queryKey: ['hi', createQueryKeyDeepArr],
		queryFn: async () => {
			const data = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
			const b = (await data.json()) as typeof sample;
			return new Date().getTime();
		}
	});
	// should deduplicate
	const data1 = createQuery({
		queryKey: ['hi', createQueryKeyDeepArr],
		queryFn: () => fetch('https://pokeapi.co/api/v2/pokemon/ditto')
	});

	function updateCreateQueryKey() {
		createQueryKey = 'a new string';
		createQueryKeyDeep.push(Date.now());
		createQueryKeyDeepArr.test.push('a new date');
	}

	// create queries
	let keys = $state(['123', '123']);
	const dat1 = createQueries({
		queries: [
			{ queryFn: () => 1, queryKey: keys },
			{ queryFn: () => 2, queryKey: ['aa'] }
		]
	});
	const mutate = createMutation({
		mutationKey: ['1'],
		mutationFn: () => {
			return new Promise((a) => setTimeout(a('12312'), 1000));
		},
		onSuccess: () => {
			client.setQueryData([createQueryKey], (v) => {
				return ['mutated'];
			});
		}
	});
	const client = useQueryClient();

	console.log('data', dat1, client);
	let show = $state(false);
	let newState = $state({ bbb: '12312312' });
</script>

<button onclick={() => stateSample.updateHost(newState)}>op {JSON.stringify(stateSample)} </button>

<hr />
<div>
	<h1>Create Query</h1>
	<h4>
		Cases for different type of query key
		<br />
		<ul>
			<li>String key:{createQueryKey}</li>
			<li>arr Key{createQueryKeyDeep}</li>
			<li>Object Key{createQueryKeyDeep}</li>
		</ul>
	</h4>

	<!-- 	<button onclick={() => client.invalidateQueries({queryKey:createQuery})}>invalidate</button>
	<button onclick={() => client.setQueryData(key.queryKey, (old) => ['new data'])}>SetCache</button> -->
	<button onclick={updateCreateQueryKey}>Update query Options</button>
	<button>invalidate</button>

	<pre>Result: {JSON.stringify(data, null, 3)}</pre>
	<hr />
	<pre>Data: {JSON.stringify(data.data)}</pre>
	<hr />
	<div>isError: {data.isError}</div>
	<button
		onclick={() => {
			createQueryKeyDeepArr.test.push('what is this');
		}}
	>
		update query key : should deduplicate</button
	>
</div>

<br />

<div>
	<h1>Create Queries</h1>
	<h2>
		QueryOptions: {JSON.stringify([
			{ queryFn: () => 1, queryKey: keys },
			{ queryFn: () => 2, queryKey: ['aa'] }
		])}
	</h2>

	<button onclick={() => client.invalidateQueries(key.queryKey)}>invalidate</button>
	<button onclick={() => client.setQueryData(key.queryKey, (old) => ['new data'])}>SetCache</button>
	<button>invalidate</button>

	<div>Result: {JSON.stringify(data)}</div>
	<hr />
	<div>Data: {JSON.stringify(data.data)}</div>
	<hr />
	<div>isError: {JSON.stringify(data)}</div>
</div>

{JSON.stringify(dat1)}

<hr />
<h1>mutation</h1>
<button onclick={mutate.mutate}>mutation {mutate.status}</button>
<hr />
{#if show}
	<Test1 />
{/if}
<button onclick={() => (show = !show)}>Toggle Test1</button>
