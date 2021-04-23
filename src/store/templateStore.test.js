import {
  reset,
  action,
  asyncAdd1,
  asyncSetNum,
  multiAction,
} from "./templateStore.js"

it('adds 100 to num', () => {
  // arrange
  const initialState = reset()
  // act
  const newState = action()
  // assert
  expect(newState.num).toBe(initialState.num + 100)
})

it('increases num async', async () => {
  const initialState = reset()
  const newState = await asyncAdd1()
  expect(newState.num).toBeGreaterThan(initialState.num)
})

it('sets num async', async () => {
  const testNum = 1337
  const {num} = await asyncSetNum(testNum)
  expect(num).toEqual(testNum)
})

it('compares two specific states', async () => {
  reset({
    num: 660,
    numList: [4, 2],
  })
  const newState = await multiAction()
  expect(newState).toMatchObject({
    num: 677,
    numList: [4, 2, 666, 677]
  })
})
