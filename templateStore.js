import { useObservable } from './storeUtils.js'

// State
function State () {return {
	num: 42,
	list: [],
}}

const [storeIn, storeOut, getState] = useObservable(new State)
console.info('State:', getState())
export const playlistStore = storeOut

// Actions
export function reset () {
	const state = new State
	Object.keys(state)
		.map(key => storeIn[key].set(state[key]))
}

export async function demoAction () {
	const {num, list} = getState()
	list.push(num)
	const numDouble = num * 2
	const result = await apiCall()
	if (result) console.info('api returned')
	storeIn.num.set(numDouble)
	storeIn.list.set(list)
}

const apiCall = async () => {
	const prom = new Promise((resolve, reject) => {
		window.setTimeout(() => resolve(true), 2000)
	})
	const result = await prom
	return result
}

