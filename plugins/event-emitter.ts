// filepath: c:\Users\lenovo\WebstormProjects\saadi-mahbouba-archive-front-end\plugins\event-emitter.ts
import mitt from 'mitt'

export default defineNuxtPlugin(() => {
  const emitter = mitt()

  return {
    provide: {
      emitter
    }
  }
})
