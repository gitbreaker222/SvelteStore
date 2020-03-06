import { useStore } from "./storeUtils.js";

function State() {
  return {
    pile: [],
    item: null,
    list: [{ id: 1 }, { id: 2 }, { id: 3 }],
    demo1: true,
    demo2: 42,
    demo3: "",
    demo4: 13.37,
    demo5: "lorem ipsum dolor sit amet",
    demoObj: { id: "demo" }
  };
}

const [storeIn, storeOut] = useStore(new State(), "listStore");
export const listStore = storeOut;

// Actions
export function setCurrent(newItem) {
  storeIn.update(function setCurrent(state) {
    let { pile, item } = state;

    if (item) {
      pile = [...pile];
      pile.push(item);
    }
    item = newItem;

    return { ...state, pile, item };
  });
}

export function nextItem() {
  storeIn.update(function nextItem(state) {
    let { item, list } = state;

    if (list.length) list = [...list];
    item = list.shift() || null;
    setCurrent(item);

    return { ...state, list };
  });
}

export function reset() {
  storeIn.set(new State());
}
