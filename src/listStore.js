import { useStore } from "./storeUtils.js";

function State() {
  return {
    pile: [],
    item: null,
    list: [{ id: 1 }, { id: 2 }, { id: 3 }],
    demo1: true,
    demo2: 42,
    demo3: NaN,
    demo4: 1337,
    demo5: "lorem ipsum dolor sit amet",
    demoObj: { id: "demo" }
  };
}

const [storeIn, storeOut] = useStore(new State(), "list state");
export const listStore = storeOut;

// Actions
export function nextItem() {
  storeIn.update(function nextItem(state) {
    let { pile, item, list } = state;
    if (item) {
      pile = [...pile];
      pile.push(item);
    }
    if (list.length) list = [...list];
    item = list.shift() || null;

    return { ...state, pile, item, list };
  });
}

export function reset() {
  storeIn.set(new State());
}
