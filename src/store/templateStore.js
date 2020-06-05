import { useStore } from "./_svelteStore.js"

// State
function State() {
  return {
    num: 0,
    numList: []
  }
}

const [storeIn, storeOut] = useStore(new State(), {
  name: "templateStore",
  persist: true,
})
export const templateStore = storeOut

// Actions
export function reset() {
  return storeIn.set('reset', new State())
}

//=== Everything below this line can be safely deleted ===
// Demo-Actions

export const action = () => {
  return storeIn.update('action', state => {
    let { num } = state
    return { ...state, num: num + 100 }
  })
}
const _defer = value => new Promise(resolve => {
  window.setTimeout(() => resolve(value), 1000)
})
export const asyncAdd1 = async () => {
  return storeIn.update('asyncAdd1', async state => {
    let { num } = state
    num = await _defer(num + 1)
    return { ...state, num }
  })
}

export const asyncSetNum = async (value) => {
  return storeIn.update('asyncSetNum', async state => {
    let num = await _defer(value)
    return { ...state, num }
  })
}

export const multiAction = async () => {
  let state = storeOut.get()

  const numToList = state => {
    let { num, numList } = state
    numList = [...numList]
    numList.push(num)
    return { ...state, numList, num }
  }

  await asyncSetNum(state.num + 5)
  await asyncAdd1()
  // re-assign updated state when using it
  state = storeIn.update('numToList', numToList)
  state = await asyncSetNum(state.num + 5)
  await asyncSetNum(state.num + 5)
  await asyncAdd1()
  return storeIn.update('numToList', numToList)
}