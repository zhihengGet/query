<script>
	let count = $state({});
	let c = $state({});
	setInterval(() => {
		count = { b: Date.now() };
	}, 1000);

	$effect(() => {
		c = { ...count };
		console.log('is effect used', count);
	});
	function increment() {}
</script>

<button onclick={increment}>
	clicks: {count.b}
	{c.b}
</button>
