import mitt from 'mitt'

export const emitter = mitt()

export function clearEmitter() {
  emitter.all.clear()
}
