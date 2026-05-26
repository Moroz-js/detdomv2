'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import {
  applyVisionStateToDocument,
  defaultVisionState,
  loadVisionState,
  saveVisionState,
  type VisionFontLevel,
  type VisionState,
  type VisionTheme,
} from '@/lib/visionAccessibility'

type VisionContextValue = {
  enabled: boolean
  font: VisionFontLevel
  theme: VisionTheme
  images: boolean
  toggleEnabled: () => void
  disable: () => void
  setFont: (font: VisionFontLevel) => void
  setTheme: (theme: VisionTheme) => void
  toggleImages: () => void
}

const VisionAccessibilityContext = createContext<VisionContextValue | null>(null)

export function useVisionAccessibility() {
  const ctx = useContext(VisionAccessibilityContext)
  if (!ctx) {
    throw new Error('useVisionAccessibility must be used within VisionAccessibilityProvider')
  }
  return ctx
}

export function VisionAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VisionState>(defaultVisionState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(loadVisionState())
    setReady(true)
  }, [])

  useLayoutEffect(() => {
    if (!ready) return
    applyVisionStateToDocument(state)
    saveVisionState(state)
  }, [state, ready])

  const update = useCallback((patch: Partial<VisionState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<VisionContextValue>(
    () => ({
      enabled: state.enabled,
      font: state.font,
      theme: state.theme,
      images: state.images,
      toggleEnabled: () => setState((prev) => ({ ...prev, enabled: !prev.enabled })),
      disable: () => setState((prev) => ({ ...prev, enabled: false })),
      setFont: (font) => update({ font }),
      setTheme: (theme) => update({ theme }),
      toggleImages: () => setState((prev) => ({ ...prev, images: !prev.images })),
    }),
    [state.enabled, state.font, state.theme, state.images, update],
  )

  return <VisionAccessibilityContext.Provider value={value}>{children}</VisionAccessibilityContext.Provider>
}
