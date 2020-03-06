import { writable } from "svelte/store";

const deepCopy = value => JSON.parse(JSON.stringify(value));

const checkType = (value, newValue, name = "") => {
  const t1 = typeof value;
  const t2 = typeof newValue;
  if (t1 !== t2) {
    console.warn(`Type warning: ${name} Expected ${t1}, got ${t2}`);
  }
};

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
  try {
    sessionStorage.setItem(
      `svelteStore ${storeName}`,
      JSON.stringify(newState)
    );
  } catch (e) {
    console.error("sessionStorage needs Same-Origin-Policy to work");
  }
};

export const useStore = (state, name = "unnamed state") => {
  console.info(name, state);
  const initialState = deepCopy(state); //if devEnv
  const { subscribe, update, set } = writable(state);

  const interceptUpdate = callback => {
    let newState;
    update(state => {
      newState = callback(state);

      function doTheRest(_state) {
        Object.keys(initialState).map(key => {
          checkType(initialState[key], _state[key], key);
        });
        logUpdate(state, _state, callback.name, name); //if devEnv
        return { ..._state };
      }

      if (newState instanceof Promise) {
        return newState.then(doTheRest);
      }

      return doTheRest(newState);
    });
    return newState;
  };

  const storeIn = { update: interceptUpdate, set };
  const storeOut = { subscribe };
  return [storeIn, storeOut];
};
