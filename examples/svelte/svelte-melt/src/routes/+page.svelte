<script lang="ts">
  import Simple from './paginate.svelte'
  import Cache from './cacheUpdate.svelte'
  import Simple1 from './test.svelte'
  import DerivedQuery from './derivedQuery.svelte'
  import Queries from './queries.svelte'
  import CQueries from './CreateQueries.svelte'
  import { useIsRestoring } from '@tanstack/svelte-query'
  const isRes = useIsRestoring()

  $effect(() => {
    console.log('is rest', isRes())
  })
</script>

isReTORING:{isRes()}
<!-- <h1>testing list query cache update</h1>
<Simple />
<h1>testing DerivedQuery cache update</h1> -->
<Simple1 />
<!-- <h1>testing pagination with createQuery</h1>
<Simple />
<hr />

<h1>testing cache update</h1>
<Cache />
<hr />
-------------

<Simple1 />
 -->
