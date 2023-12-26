<script>
	import { createQuery } from '@tanstack/svelte-query';

	const data = createQuery({ queryKey: '1', queryFn: () => ['12321'] });
</script>

{JSON.stringify(data())}
