import { useStore } from "./_svelteStore.js"

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
  }
}

const [storeIn, storeOut] = useStore(new State(), { name: "listStore" })
export const listStore = storeOut

// Actions
export function reset() {
  return storeIn.set('reset', new State())
}

export const setCurrent = newItem => {
  return storeIn.update('setCurrent', state => {
    let { pile, item } = state

    if (item) {
      pile = [...pile]
      pile.push(item)
    }
    item = newItem

    return { ...state, pile, item }
  })
}

export const nextItem = () => {
  let item

  storeIn.update('nextItem', state => {
    let { list } = state

    if (list.length) list = [...list]
    item = list.shift() || null

    return { ...state, list }
  })

  return setCurrent(item)
}

export const busyTask = () => {
  const duration = 3000 //ms
  const interval = 100 //ms

  const intervalId = window.setInterval(
    () => {
      console.log('busy')
      return storeIn.update(
        'performanceDrain',
        state => ({ ...state, item: { id: Math.random() } })
      )
    }, interval
  )
  setTimeout(() => {
    window.clearInterval(intervalId)
  }, duration)
  return
}