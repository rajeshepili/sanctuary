import { useEffect, useRef } from 'react'

export function useTimeout(
  callback: () => void,
  delay: number,
  deps: any[] = [],
) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    const id = setTimeout(() => saved.current(), delay)
    return () => clearTimeout(id)
  }, [delay, ...deps])
}
