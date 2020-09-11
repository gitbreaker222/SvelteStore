import { writable } from "svelte/store"

const settings = {
  loopGuard: true,
}

const logPrefix = [
  '%cSvelteStore',
  [
    `background: #ff3e00`,
    `border-radius: 0.5em`,
    `color: white`,
    `font-weight: bold`,
    `padding: 2px 0.5em`,
  ].join(';')
]

const persistRead = (name) => (
  JSON.parse(localStorage.getItem(name))
)
const persistWrite = (name, state) => (
  localStorage.setItem(name, JSON.stringify(state))
)

const loopGuard = {
  index: new Map(),
  register: function (action) {
    const now = Date.now()
    const repeatDelay = 150 // A bit faster than fast clicks
    const totalDelay = 3000
    const entryExeedsAt = this.index.get(action)
    const blockFlag = -1
    let expirationTime = 0
    let isExpired = true

    const forgetAfter = (delay, proofTime) => {
      window.setTimeout(() => {
        const currentEntry = this.index.get(action)

        if (currentEntry === proofTime) {
          this.index.delete(action)
        } else {
          console.debug(...logPrefix, 'Possible infinite loop:', action)
        }
      }, delay)
    }

    if (entryExeedsAt === blockFlag) return isExpired

    if (!entryExeedsAt) {
      expirationTime = now + totalDelay
    } else {
      expirationTime = entryExeedsAt - 1
    }

    isExpired = expirationTime < now

    if (isExpired) {
      expirationTime = blockFlag

      console.error(...logPrefix, 'Infinite loop detected:', action)
      const isConfirmed = confirm(`The action "${action}" seems to repeat infinitley.
      Do you want to reload the window?
      `)
      if (isConfirmed) {
        window.location.reload()
        const msg = `
Action has been called repeatedly with an interval of less than ${repeatDelay} ms and within a max time frame of ${totalDelay} ms`
        throw new Error(msg)
      }
    }
    this.index.set(action, expirationTime)
    forgetAfter(repeatDelay, expirationTime)

    return isExpired
  }
}

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
  console.info(...logPrefix, name, state)
  const { subscribe, update, set } = writable(state)
  let currentState = { ...state }

  const interceptUpdate = (actionName, callback) => {
    let callbackResult

    update(state => {
      if (settings.loopGuard && loopGuard.register(actionName)) return state

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
