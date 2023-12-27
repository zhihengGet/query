<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	let key = $state({ queryKey: ['hi'], queryFn: () => ['12321'] });
	const data = createQuery(key);

	const del = createMutation({
		mutationKey: ['1'],
		mutationFn: async () => {
			return new Promise((a) => setTimeout(a('12312'), 500));
		}
	});
	function d() {
		del.mutate();
		key.queryKey[0] = 'w';
	}
	console.log('dta', data, data.data);
	7;
</script>

hello world
<button onclick={d}>del {del.status}</button>
{JSON.stringify(data.data)}
