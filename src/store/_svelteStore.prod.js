import { writable } from "svelte/store"

const persistRead = (name) => (
  JSON.parse(localStorage.getItem(name))
)
const persistWrite = (name, state) => (
  localStorage.setItem(name, JSON.stringify(state))
)

export const useStore = (state, opts) => {
  const {
    name = "unnamed state",
    persist = false,
  } = opts
  const persistName = `svelteStore.${name}`
  if (persist) {
    const persistedState = persistRead(persistName)
    if (persistedState) state = persistedState
    else persistWrite(persistName, state)
  }
  const { subscribe, update, set } = writable(state)
  let currentState = { ...state }

  const interceptUpdate = (actionName, callback) => {
    let callbackResult

    update(state => {
      callbackResult = callback(state)

      function main(_state, asyncResolved = false) {
        currentState = { ..._state }
        if (persist) persistWrite(persistName, currentState)
        if (asyncResolved) set(currentState)
        else return currentState
      }

      if (callbackResult instanceof Promise) {
        callbackResult.then(result => main(result, true))
        return currentState
      }
      return main(callbackResult)
    })
    return callbackResult
  }

  const interceptSet = (actionName, newState) => {
    interceptUpdate(actionName, () => newState)
  }

  const get = () => currentState

  const storeIn = { update: interceptUpdate, set: interceptSet }
  const storeOut = { subscribe, get }
  return [storeIn, storeOut]
}
