<svelte:options immutable />
<script>
	import { afterUpdate } from 'svelte';

	export let item;

	let el;
	
	function flash(element) {
		requestAnimationFrame(() => {
			element.style.transition = 'none';
			element.style.color = 'rgba(255,62,0,1)';
			element.style.backgroundColor = 'rgba(255,62,0,0.2)';

			setTimeout(() => {
				element.style.transition = 'color 1s, background 1s';
				element.style.color = '';
				element.style.backgroundColor = '';
			});
		});
	}

	afterUpdate(() => {
		flash(el);
	});
</script>

<!-- the text will flash red whenever
     the object changes -->
<span bind:this={el} >
	{item.id}
</span>
