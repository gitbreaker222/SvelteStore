import { writable } from 'svelte/store';

export const useObservable = (state) => {
	const keys = Object.keys(state)
	const storeIn = {}
	const storeOut = {}

	keys.map(key => {
		const {subscribe, set, update} = writable(state[key])
		// maybe better to use derived store for logging instead this wrapper?
		const _update = (cb) => {
			update(value => {
				const newValue = cb(value)
				const stateLog = {
					old: value,
					new: newValue,
				}
				console.table({[key]: stateLog})
				//console.info(`update "${key}" (old:new):`, value, newValue)
				state[key] = newValue
				return newValue
			})
		}
		const _set = newValue => _update(() => newValue)
		storeIn[key] = {set: _set, update: _update}
		storeOut[key] = {subscribe}
	})
	const getState = () => JSON.parse(JSON.stringify(state))
	return [storeIn, storeOut, getState]
}
