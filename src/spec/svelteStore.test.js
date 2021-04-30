import { deepCopy } from "../store/_svelteStore.debug"

describe('type comparison with deepCopy', () => {
  it('deep copies primitives', () => {
    const state = {
      bool1: true,
      bool2: false,
      string1: '',
      string2: 'Aa',
      number1: -1,
      number2: 0,
      number3: 1,
      float: 0.3,
    }
    const result = deepCopy(state)

    expect(result).not.toBe(state) // new object
    expect(result).toEqual(state) // structure + values
  })

  it('deep copies arrays/objects', () => {
    const state = {
      array: [123],
      array1: [],
      obj: {a: 1},
      obj1: {},
      obj2: null,
    }
    const result = deepCopy(state)

    expect(result).not.toBe(state) // clone
    expect(result).toEqual(state) // structure

    expect(result.array).not.toBe(state.array)
    expect(result.array[0]).toBe(state.array[0])

    expect(result.obj).not.toBe(state.obj)
    expect(result.obj.a).toBe(state.obj.a)

    expect(typeof result.obj2).toBe(typeof state.obj2)
  })

  it('preserves non-json values', () => {
    const state = {
      number: NaN,
      infinityPositive: Infinity,
      infinityNegative: -Infinity,
    }
    const result = deepCopy(state)

    expect(result).toEqual(state)
    expect(typeof result.number).toBe(typeof state.number)
  })
})