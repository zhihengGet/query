<script lang="ts">
	import { createMutation, createQuery, createQueries } from '@tanstack/svelte-query';

	let key = $state({ queryKey: ['hi'], queryFn: () => ['12321'] });

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
	function d() {
		del.mutate();
		key.queryKey[0] = 'w';
		keys[0] = '111';
	}
	console.log('dta', dat1);
</script>

hello world {keys[0]}
<button onclick={d}>del {del.status}</button>
{JSON.stringify(data.data)}
{JSON.stringify(dat1)}
