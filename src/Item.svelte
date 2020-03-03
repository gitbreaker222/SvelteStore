<svelte:options immutable />
<script>
	import { afterUpdate } from 'svelte';
	import flash from './flash.js';

	export let item;

	let li;

	afterUpdate(() => {
		flash(li);
	});
</script>

<!-- the text will flash red whenever
     the object changes -->
<li bind:this={li} >
	{item.id}
</li>
