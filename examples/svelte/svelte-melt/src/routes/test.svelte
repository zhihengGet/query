<script lang="ts">
	import {
		createMutation,
		createQuery,
		createQueries,
		useQueryClient
	} from '@tanstack/svelte-query';

	let key = $state({
		queryKey: ['hi'],
		queryFn: () => new Promise((a) => setTimeout(() => a(['createQuery'], 5000)))
	});

	let key1 = $state(['abc']);
	let key2 = { queryKey: ['hi'], queryFn: () => ['12321'] };

	const data = createQuery(key);

	let keys = $state(['123', '123']);
	const dat1 = createQueries({
		queries: [
			{ queryFn: () => 1, queryKey: keys },
			{ queryFn: () => 2, queryKey: ['aa'] }
		]
	});
	const del = createMutation({
		mutationKey: ['1'],
		mutationFn: async () => {
			return new Promise((a) => setTimeout(a('12312'), 500));
		}
	});
	const client = useQueryClient();
	function d() {
		del.mutate();
		key.queryKey[0] = 'w';
		keys[0] = '111';
		client.invalidateQueries(['hi']);
	}
	console.log('dta', dat1, client);
</script>

<div>
	<h1>Create Query</h1>
	<h2>QueryOptions: {key}</h2>

	<button onclick={() => client.invalidateQueries(key.queryKey)}>invalidate</button>
	<button onclick={() => client.setQueryData(key.queryKey, (old) => ['new data'])}>SetCache</button>
	<button>invalidate</button>

	<div>Result: {JSON.stringify(data)}</div>
	<hr />
	<div>Data: {JSON.stringify(data.data)}</div>
	<hr />
	<div>isError: {JSON.stringify(data)}</div>
</div>

<br />
<button onclick={d}>del {del.status}</button>

{JSON.stringify(dat1)}
