# Svelte Store

Template for client side svelte store _(unofficial)_

![diagram](./docs/Svelte%20Store.png)

live demo: https://svelte.dev/repl/a76e9e11af784185a39020fec02b7733?version=3.19.1

## Features

For detailed insight of changes or the current state , all you need is your browsers dev-tools. No plugins, zero dependencies _(besides svelte)_.

- Before/After difference on state updates  
  ![logs](./docs/logs.png)
- Show full state in SessionStorage  
  ![full state](./docs/full-state.png)

## Rules

### The "IMMUTABLE" Rule:

If you change something (state Object, a list inside state, etc...), **make a shallow copy of it!**

good:

```javascript
let { list } = state;

const updtedList = [...list];
updatedList.push(1234);

return { ...state, list: updatedList };
```

bad:

```javascript
let { list } = state;

// mutated objects won't be detected as a change
list.push(1234);

return Object.assign(state, { list });
```

bad:

```javascript
//every object will look like a change
let { list } = deepCopy(state);

list.push(1234);

return { ...state, list };
```

### The "NESTED ACTIONS" Rule:

If you call an **action inside an action** you must re-assign the return value to state

good:

```javascript
let { isLightOn } = state;

isLightOn = !isLightOn;
//if !isLightOn => state.isDoorLocked = true
state = lockDoor(!isLightOn); //updates state

return { ...state, isLightOn };
```

bad:

```javascript
let { isLightOn } = state;

isLightOn = !isLightOn;
lockDoor(!isLightOn); //forgot state update

//resets isDoorLocked with old state
return { ...state, isLightOn };
```

## Test locally

Install the dependencies...

```bash
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running.
