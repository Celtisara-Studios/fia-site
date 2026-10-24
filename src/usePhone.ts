import { useSyncExternalStore } from 'react'

/** Phone-sized screens, upright or turned on their side. Tablets and up get the desk. */
const PHONE = '(max-width: 767px), (pointer: coarse) and (max-height: 500px)'

const query = window.matchMedia(PHONE)

const subscribe = (onChange: () => void) => {
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export const usePhone = () => useSyncExternalStore(subscribe, () => query.matches)
