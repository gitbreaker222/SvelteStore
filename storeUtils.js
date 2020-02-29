import { writable } from 'svelte/store';

const deepCopy = value => JSON.parse(JSON.stringify(value))

const checkType = (value, newValue, name = '') => {
	const t1 = typeof value
	const t2 = typeof newValue
	if (t1 !== t2){
		console.warn(`Type warning: ${name} Expected ${t1}, got ${t2}`)
	}
}

const logUpdate = (value, newValue, action) => {
	const update = {
		current: value,
		new: newValue,
	}
	console.info(action ? `Action: ${action}` : 'Unknown update')
	console.table(update)
}

export const useObservable = (state, name = 'new state') => {
	console.info(name, state)
	const initialState = deepCopy(state) //if devEnv
	const {subscribe, update, set} = writable(state)
	
	const interceptUpdate = (callback) => {
		update(state => {
			const prevState = deepCopy(state) //if devEnv
			const newState = callback(state)
			Object.keys(initialState).map(key => {
				checkType(initialState[key], newState[key], key)
			})
			logUpdate(prevState, newState, callback.name) //if devEnv
			return {...newState}
		})
	}
	
	const storeIn = {update: interceptUpdate, set}
	const storeOut = {subscribe}
	return [storeIn, storeOut]
}
