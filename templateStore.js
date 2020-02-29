import { useStore } from './storeUtils.js'

// State
function State () {return {
	num: 42,
	list: [],
}}

const [storeIn, storeOut] = useStore(new State, 'template state')
export const templateStore = storeOut

// Actions
export function reset () {
	storeIn.set(new State)
}

export async function demoAction () {
	storeIn.update(function demoAction (state) {
		let {num, list} = state
		
		list = [...list]
		list.push(num)
		num = num * 2
		
		const result = await _apiCall()
		if (result) console.info('api returned')
		
		return {...state, list, num}
	})
}

const _apiCall = async () => {
	const promise = new Promise((resolve, reject) => {
		window.setTimeout(() => resolve(true), 2000)
	})
	const result = await promise
	return result
}

