import { useStore } from "./storeUtils.js";

/* THE "IMMUTABLE" RULE:
If you change something (state Object, a list inside state, etc...)
 => make a shallow copy of it!
 
const { list } = state

const updtedList = [...list]
updatedList.push(1234) 
 
return {...state, list: updatedList}
*/

// State
function State() {
  return {
    num: 42,
    list: []
  };
}

const [storeIn, storeOut] = useStore(new State(), "templateStore");
export const templateStore = storeOut;

// Actions
export function reset() {
  storeIn.set(new State());
}

export const nestedAsyncAction = async () =>
  storeIn.update(async function nestedAction(state) {
    let { num } = state;

    const promiseDouble = new Promise(resolve => {
      window.setTimeout(() => resolve(num * 2), 2000);
    });
    num = await promiseDouble;

    return { ...state, num };
  });

export const demoAction = async () =>
  storeIn.update(async function demoAction(state) {
    state = await nestedAsyncAction();

    let { num, list } = state;
    list = [...list];
    list.push(num);

    return { ...state, list, num };
  });
