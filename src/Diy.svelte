<script>
	let hidden = true
	const toggle = () => {
		hidden = !hidden
	}
	
	console.info(`
Note on REPL Console: For best dev experience open the browser dev-tools! F12 / CMD+OPTION+C
  `)
</script>

<h2>
	Do it yourself:
</h2>

<p>
	(1) Now open the file called <code>settingsStore.js</code> and copy the content from <code>templateStore.js</code>.
	<br/>
	(2) Then give <code>State</code> an <code>autosave</code> boolean field 
	<br/>
	and (3) a <code>toggleAutosave</code> action.
	<br/>
	(4) Finally in <code>App.svelte</code> import <code>settingsStore, toggleSetting</code>
	<br/>
	and (5) update the checkbox below.
</p>
<div>
	<button on:click={toggle}>
		<em>Show me!</em>
	</button>
	<pre {hidden}>
	{`
/* settingsStore.js */
import { useStore } from "./_svelteStore.js"

// State
function State() {
  return {
    autosave: true, // DIY Step #2
  }
}

const [storeIn, storeOut] = useStore(new State(), {
  name: "settingsStore",
  persist: false,
})
export const settingsStore = storeOut

// Actions
export function reset() {
  return storeIn.set('reset', new State())
}

// DIY Step #3
export const toggleAutosave = () => {
  storeIn.update('toggleAutosave', state => {
    let { autosave } = state
    return { ...state, autosave: !autosave }
})}

	`}
	</pre>
</div>

