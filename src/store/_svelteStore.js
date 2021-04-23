import { useStore as debugStore } from "./_svelteStore.debug"
import { useStore as prodStore } from "./_svelteStore.prod"

const isDebug = process.env.NODE_ENV === 'debug'
export const useStore = isDebug ? debugStore : prodStore