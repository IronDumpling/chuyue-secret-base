import { useEffect, useLayoutEffect } from 'react'

// useLayoutEffect on the client, a plain no-op on the server (where React 18 warns about it).
// For reading something the browser already knows (storage, the DOM) before the first paint.
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
