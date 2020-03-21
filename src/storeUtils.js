import { writable } from "svelte/store";

const settings = {
  devEnv: true,
  tickLog: true,
}

const deepCopy = value => JSON.parse(JSON.stringify(value));

const checkType = (value, newValue, name = "") => {
  const t1 = typeof value;
  const t2 = typeof newValue;
  if (t1 !== t2) {
    console.warn(`Type warning: ${name} Expected ${t1}, got ${t2}`);
  }
};

// setup tickLog
// https://stackoverflow.com/questions/6343450/generating-sound-on-the-fly-with-javascript-html5#16573282
const audioCtx = new AudioContext();

const tickLog = async () => {
  let osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 5000;

  var vol = audioCtx.createGain();
  vol.gain.value = 0.05;

  osc.connect(vol);
  vol.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + .1);
}

const logUpdate = (state, newState, action, storeName) => {
  const _state = {};
  const _newState = {};

  Object.keys(state)
    .filter(key => state[key] !== newState[key])
    .map(key => {
      _state[key] = state[key];
      _newState[key] = newState[key];
    });

  const update = {
    before: _state,
    after: _newState
  };
  console.debug(action ? `Action: ${action}` : "Unknown update");
  console.table(update);
  if (settings.tickLog) tickLog()
  try {
    sessionStorage.setItem(
      `svelteStore ${storeName}`,
      JSON.stringify(newState)
    );
  } catch (e) {
    console.warn("sessionStorage needs Same-Origin-Policy to work");
  }
};

export const useStore = (state, name = "unnamed state", persist = false) => {
  console.info(name, state);
  const persistName = `STORE_UTILS.${name}`
  if (persist) state = localStorage.getItem(persistName)
  const initialState = settings.devEnv ? deepCopy(state) : null;
  const { subscribe, update, set } = writable(state);
  let currentState = { ...state };

  const interceptUpdate = callback => {
    let callbackResult
    update(state => {
      callbackResult = callback(state);

      function main(_state, asyncResolved = false) {
        if (settings.devEnv) {
          Object.keys(initialState).map(key => {
            checkType(initialState[key], _state[key], key);
          });
          logUpdate(state, _state, callback.name, name);
        }

        currentState = { ..._state }
        if (persist) localStorage.setItem(persistName, JSON.stringify(currentState))
        if (asyncResolved) set(currentState)
        else return currentState;
      }

      if (callbackResult instanceof Promise) {
        callbackResult.then(result => main(result, true))
        return currentState
      }
      return main(callbackResult)
    });
    return callbackResult
  };

  const get = () => currentState

  const storeIn = { update: interceptUpdate, set }; //TODO intercept set
  const storeOut = { subscribe, get };
  return [storeIn, storeOut];
};
