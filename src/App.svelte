<script>
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	
	import {listStore, nextItem, reset} from './store/listStore.js'
	// import {settingsStore, toggleAutosave} from './settingsStore.js' //DIY Step #4
	import FlashItem from './FlashItem.svelte'
	import Diy from './Diy.svelte'

	$: list = $listStore.list
	$: item = $listStore.item
	$: itemArr = item ? [item] : []
	$: pile = $listStore.pile
	
	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} ;
					opacity: ${t}
				`
			};
		}
	})
	
</script>

<style>
	ul {
		display: flex;
		flex-flow: column;
		align-items: flex-start;
	}
</style>

<button on:click={nextItem}>pick from list</button>
<button on:click={reset}>reset</button>

<h1>List</h1>
<ul>
	{#each list as item (item.id)}
		<li in:receive="{{key: item.id}}"
				out:send="{{key: item.id}}"
				animate:flip
				>
			<FlashItem {item}/>
		</li>
	{:else}
		<li>-</li>
	{/each}
</ul>

<h1>current item: 
	{#each itemArr as item (item.id)}
	<span in:receive="{{key: item.id}}"
				out:send="{{key: item.id}}"
				animate:flip
				>
		<FlashItem {item}/>
	</span>
	{/each}
</h1> 

<h1>Pile</h1>
<ul>
	{#each pile as item (item.id)}
		<li in:receive="{{key: item.id}}"
				out:send="{{key: item.id}}"
				animate:flip
				>
			<FlashItem {item}/>
		</li>
	{:else}
		<li>-</li>
	{/each}
</ul>

<hr/>

<Diy />

<h3>Settings:</h3>
<label>
	<!-- DIY Step #5
  <input type=checkbox
				 checked={$settingsStore.autosave}
				 on:change={toggleAutosave} />
   -->
	<input type=checkbox />
  Autosave
</label>
<!--
  Note: bind:checked is not supported by design, as it would bypass the internal store mechanics.
  And by writing actions for store-updates we create a habit of separating business-logic from views.
-->