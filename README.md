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

## One rule

**THE "IMMUTABLE" RULE:** If you change something (state Object, a list inside state, etc...), **make a shallow copy of it!**

good:

```javascript
const { list } = state;

const updtedList = [...list];
updatedList.push(1234);

return { ...state, list: updatedList };
```

bad:

```javascript
const { list } = state;

// mutated objects won't be detected as a change
list.push(1234);

return Object.assign(state, { list });
```

bad:

```javascript
//every object will look like a change
const { list } = deepCopy(state);

list.push(1234);

return { ...state, list };
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
