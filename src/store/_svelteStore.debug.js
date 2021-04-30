import { writable } from "svelte/store"

const settings = {
  isTickLog: true, // DEBUG FEATURE
  isLoopGuard: true, // DEBUG FEATURE
}

const logPrefix = [
  '%cSvelteStore',
  [
    'background: #ff3e00',
    'border-radius: 0.5em',
    'color: white',
    'font-weight: bold',
    'padding: 2px 0.5em',
  ].join(';')
]

/* DEBUG FEATURE ===================== */
export const deepCopy = value => {
	const replacedNaN = 'svelteStoreReplace:NaN'
	const replacedInfinityP = 'svelteStoreReplace:Infinity+'
	const replacedInfinityN = 'svelteStoreReplace:Infinity-'
	const deepCopyStr = JSON.stringify(value, function(name, _value) {
    if (Number.isNaN(_value)) return replacedNaN
    if (_value === Infinity) return replacedInfinityP
    if (_value === -Infinity) return replacedInfinityN
		return _value
	})
	return JSON.parse(deepCopyStr, function(name, _value) {
    if (_value === replacedNaN) return NaN
    if (_value === replacedInfinityP) return Infinity
    if (_value === replacedInfinityN) return -Infinity
		return _value
	})
}

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

const tickLog = async (audioCtx) => {
  function playAudio(frequency) {
    const duration = 0.1
    let vol = audioCtx.createGain()
    vol.gain.value = 0.02
    vol.connect(audioCtx.destination)
    
    let osc = audioCtx.createOscillator()
    osc.type = "sawtooth"
    osc.frequency.value = frequency
    osc.connect(vol)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  }
  playAudio(7786)
  playAudio(5467)
}

const logUpdate = (state, newState, action, storeName) => {
  const audioCtx = new AudioContext()
  const _state = {}
  const _newState = {}

  const changes = Object.keys(state)
    .filter(key => state[key] !== newState[key])
    .map(key => {
      _state[key] = state[key]
      _newState[key] = newState[key]
    })

  const update = {
    before: _state,
    after: _newState
  }

  if (changes.length) {
    console.log(...logPrefix, storeName, 'changed by:')
    console.groupCollapsed(
      `${action || 'Unnamed action'}`
    )
    console.table(update)
    console.groupEnd()
  } else {
    console.log(...logPrefix, storeName, 'unchanged by:', action)
  }
  if (settings.isTickLog) tickLog(audioCtx)
  try {
    sessionStorage.setItem(
      `svelteStore ${storeName}`,
      JSON.stringify(newState)
    )
  } catch (e) {
    console.debug(...logPrefix, "Cannot show current state in sessionStorage (Same-Origin-Policy). Am I in a sandbox?")
  }
}
/* DEBUG FEATURE END ================= */

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

export const useStore = (
  state,
  {
    name = "unnamed state",
    persist = false,
    isProd = false,
  }
) => {
  const persistName = `svelteStore.${name}`
  if (persist) {
    const persistedState = persistRead(persistName)
    if (persistedState) state = persistedState
    else persistWrite(persistName, state)
  }
  console.info(...logPrefix, name, state) // DEBUG FEATURE
  const initialState = !isProd ? deepCopy(state) : null // DEBUG FEATURE
  const { subscribe, update, set } = writable(state)
  let currentState = { ...state }

  const interceptUpdate = (actionName, callback) => {
    let callbackResult

    update(state => {
      if (settings.isLoopGuard && loopGuard.register(actionName)) return state

      callbackResult = callback(state)

      function main(_state, asyncResolved = false) {
        /* DEBUG FEATURE ===================== */
        if (!isProd) {
          checkSpelling(initialState, _state)
          Object.keys(initialState).map(key => {
            checkType(initialState[key], _state[key], key)
          })
          logUpdate(state, _state, actionName, name)
        }
        /* DEBUG FEATURE END ================= */

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
    return interceptUpdate(actionName, () => newState)
  }

  const get = () => currentState

  const storeIn = { update: interceptUpdate, set: interceptSet }
  const storeOut = { subscribe, get }
  return [storeIn, storeOut]
}
