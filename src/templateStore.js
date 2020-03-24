import { useStore } from "./storeUtils.js"

// State
function State() {
  return {
    num: 0,
    numList: []
  }
}

const [storeIn, storeOut] = useStore(new State(), "templateStore", true)
export const templateStore = storeOut

// Actions
export function reset() {
  storeIn.set(new State())
}

export const action = () =>
  storeIn.update(function action(state) {
    let { num } = state
    return { ...state, num: num + 100 }
  })

// Demo-Actions
const _defer = value => new Promise(resolve => {
  window.setTimeout(() => resolve(value), 1000)
})
export const asyncAdd1 = async () =>
  storeIn.update(async function asyncAdd1(state) {
    let { num } = state
    num = await _defer(num + 1)
    return { ...state, num }
  })
export const asyncSetNum = async (value) =>
  storeIn.update(async function asyncSetNum(state) {
    let num = await _defer(value)
    return { ...state, num }
  })

export const multiAction = async () => {
  let state = storeOut.get()

  function numToList(state) {
    let { num, numList } = state
    numList = [...numList]
    numList.push(num)
    return { ...state, numList, num }
  }

  await asyncSetNum(state.num + 5)
  await asyncAdd1()
  // re-assign updated state when using it
  state = storeIn.update(numToList)
  state = await asyncSetNum(state.num + 5)
  await asyncSetNum(state.num + 5)
  await asyncAdd1()
  storeIn.update(numToList)
}