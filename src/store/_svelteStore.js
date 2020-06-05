import { writable } from "svelte/store"

const settings = {
  devEnv: true, // TODO get from build parameter
  tickLog: true,
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

const deepCopy = value => JSON.parse(JSON.stringify(value))

const checkSpelling = (state, _state) => {
  const correctKeys = Object.keys(state)
  Object.keys(_state).every(key => {
    const match = correctKeys.indexOf(key) >= 0
    if (!match) {
      console.warn(...logPrefix, `Spelling seems incorrect for "${key}"
(Check debug logs for available keys)`)
      console.debug(correctKeys)
    }
    return match
  })
}

const checkType = (value, newValue, name = "") => {
  const t1 = typeof value
  const t2 = typeof newValue
  if (t1 !== t2) {
    console.warn(...logPrefix, `Type warning '${name}': Expected ${t1}, got ${t2}`)
  }
}

// setup tickLog
// https://stackoverflow.com/questions/6343450/generating-sound-on-the-fly-with-javascript-html5#16573282
// https://marcgg.com/blog/2016/11/01/javascript-audio/
const audioCtx = new AudioContext()

const tickLog = async () => {
  const duration = .1
  const freq = 1 / duration

  let osc = audioCtx.createOscillator()
  osc.type = "sawtooth"
  osc.frequency.value = freq

  let vol = audioCtx.createGain()
  vol.gain.value = 0.05

  osc.connect(vol)
  vol.connect(audioCtx.destination)

  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

const logUpdate = (state, newState, action, storeName) => {
  const _state = {}
  const _newState = {}

  Object.keys(state)
    .filter(key => state[key] !== newState[key])
    .map(key => {
      _state[key] = state[key]
      _newState[key] = newState[key]
    })

  const update = {
    before: _state,
    after: _newState
  }

  console.log(...logPrefix, 'State changed')
  console.groupCollapsed(
    `${action || 'Unnamed action'}`
  )
  console.table(update)
  console.groupEnd()
  if (settings.tickLog) tickLog()
  try {
    sessionStorage.setItem(
      `svelteStore ${storeName}`,
      JSON.stringify(newState)
    )
  } catch (e) {
    console.warn(...logPrefix, "sessionStorage needs Same-Origin-Policy to work")
  }
}

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
  const persistName = `STORE_UTILS.${name}`
  if (persist) {
    const persistedState = persistRead(persistName)
    if (persistedState) state = persistedState
    else persistWrite(persistName, state)
  }
  console.info(...logPrefix, name, state)
  const initialState = settings.devEnv ? deepCopy(state) : null
  const { subscribe, update, set } = writable(state)
  let currentState = { ...state }

  const interceptUpdate = (actionName, callback) => {
    let callbackResult
    update(state => {
      callbackResult = callback(state)

      function main(_state, asyncResolved = false) {
        if (settings.devEnv) {
          checkSpelling(initialState, _state)
          Object.keys(initialState).map(key => {
            checkType(initialState[key], _state[key], key)
          })
          logUpdate(state, _state, actionName, name)
        }

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
