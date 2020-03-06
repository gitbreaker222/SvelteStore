<script>
	import {onDestroy} from 'svelte'
	import {listStore, nextItem, reset} from './listStore.js'
	import {templateStore} from './templateStore'
	import Item from './Item.svelte'

	$: list = $listStore.list
	$: item = $listStore.item
	$: pile = $listStore.pile
	
</script>

<button on:click={nextItem}>pick from list</button>
<button on:click={reset}>reset</button>

<h1>list</h1>
<ul>
	{#each list as item}
		<Item {item}/>
	{:else}
		<li>-</li>
	{/each}
</ul>

<h1>current item: {JSON.stringify(item)}</h1> 

<h1>pile</h1>
<ul>
	{#each pile as item}
		<Item {item}/>
	{/each}
</ul>
