import { useEffect, useState } from 'react'

// Hash routes (/#/reading/story-1) work offline without server rewrites.
export type Route =
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'reading'; storyId: string }
  | { name: 'result'; storyId: string }
  | { name: 'wordpop' }
  | { name: 'progress' }
  | { name: 'miccheck' }
  | { name: 'settings' }
  | { name: 'mictest' }
  | { name: 'asrtest' }
  | { name: 'bench' }

export function parseRoute(hash: string): Route {
  const [name, arg] = hash.replace(/^#\/?/, '').split('/')
  switch (name) {
    case 'map': return { name: 'map' }
    case 'reading': return { name: 'reading', storyId: arg ?? 'story-1' }
    case 'result': return { name: 'result', storyId: arg ?? 'story-1' }
    case 'wordpop': return { name: 'wordpop' }
    case 'progress': return { name: 'progress' }
    case 'miccheck': return { name: 'miccheck' }
    case 'settings': return { name: 'settings' }
    case 'mictest': return { name: 'mictest' }
    case 'asrtest': return { name: 'asrtest' }
    case 'bench': return { name: 'bench' }
    default: return { name: 'home' }
  }
}

export function go(path: string): void {
  location.hash = `#/${path}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
