export type RouteId = 'home' | 'order' | 'confirm' | 'track' | 'system'

export interface RouteDefinition {
  id: RouteId
  path: string
  title: string
  indexable: boolean
}

export const ROUTES: Record<RouteId, RouteDefinition> = {
  home: {
    id: 'home',
    path: '/',
    title: 'Teshart — Custom Hand-Drawn Pencil Portraits',
    indexable: true,
  },
  order: {
    id: 'order',
    path: '/order',
    title: 'Create Your Portrait — Teshart',
    indexable: false,
  },
  confirm: {
    id: 'confirm',
    path: '/order/confirmed',
    title: 'Order Confirmed — Teshart',
    indexable: false,
  },
  track: {
    id: 'track',
    path: '/order/track',
    title: 'Track Your Order — Teshart',
    indexable: false,
  },
  system: {
    id: 'system',
    path: '/design-system',
    title: 'Design System — Teshart',
    indexable: false,
  },
}

export const CHECKOUT_STEPS = [
  { index: 0, id: 'portrait', label: 'Your portrait' },
  { index: 1, id: 'customize', label: 'Make it yours' },
  { index: 2, id: 'delivery', label: 'Delivery details' },
  { index: 3, id: 'review', label: 'Review & pay' },
] as const

export type CheckoutStepIndex = (typeof CHECKOUT_STEPS)[number]['index']

export function resolveRouteFromPath(pathname: string): RouteId {
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean === '/order') return 'order'
  if (clean === '/order/confirmed') return 'confirm'
  if (clean.startsWith('/order/track') || clean.startsWith('/order/TSH-')) return 'track'
  if (clean === '/design-system') return 'system'
  return 'home'
}

