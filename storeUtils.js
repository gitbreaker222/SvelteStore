import { writable } from 'svelte/store';

const checkType = (value, newValue) => {
	const t1 = typeof value
	const t2 = typeof newValue
	if (t1 !== t2){
		console.warn(`Type warning: Expected ${t1}, got ${t2}`)
	}
}

let update = {}
const logUpdate = (value, newValue, key) => {
	update[key] = {
		current: value,
		new: newValue,
	}
	setTimeout(() => {
		if (!Object.keys(update).length) return
		console.table(update)
		update = {}
	},0)
}

const deepCopy = (value) => JSON.parse(JSON.stringify(value))

export const useObservable = (state) => {
	const keys = Object.keys(state)
	const storeIn = {}
	const storeOut = {}
	const stateSnapshot = deepCopy(state)
	
	keys.map(key => {
		const {subscribe, set} = writable(state[key])
		// maybe better to use derived store for logging instead this wrapper?
		const preSet = (newValue) => {
			const value = stateSnapshot[key]
			checkType(value, newValue)
			logUpdate(value, newValue, key)
			stateSnapshot[key] = deepCopy(newValue)
			state[key] = newValue
			set(newValue)
		}
		storeIn[key] = {set: preSet}
		storeOut[key] = {subscribe}
	})
	
	return [storeIn, storeOut, state]
}
