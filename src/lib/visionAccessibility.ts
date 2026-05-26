export const VISION_STORAGE_KEY = 'detdom-vision-accessibility'

export type VisionFontLevel = '1' | '2' | '3'
export type VisionTheme = 'bw' | 'wb' | 'by'

export type VisionState = {
  enabled: boolean
  font: VisionFontLevel
  theme: VisionTheme
  images: boolean
}

export const defaultVisionState: VisionState = {
  enabled: false,
  font: '2',
  theme: 'bw',
  images: true,
}

export function applyVisionStateToDocument(state: VisionState) {
  const root = document.documentElement
  if (!state.enabled) {
    root.removeAttribute('data-vision')
    root.removeAttribute('data-vision-font')
    root.removeAttribute('data-vision-theme')
    root.removeAttribute('data-vision-images')
    return
  }
  root.setAttribute('data-vision', 'on')
  root.setAttribute('data-vision-font', state.font)
  root.setAttribute('data-vision-theme', state.theme)
  root.setAttribute('data-vision-images', state.images ? 'on' : 'off')
}

export function loadVisionState(): VisionState {
  if (typeof window === 'undefined') return defaultVisionState
  try {
    const raw = localStorage.getItem(VISION_STORAGE_KEY)
    if (!raw) return defaultVisionState
    const parsed = JSON.parse(raw) as Partial<VisionState>
    return {
      enabled: Boolean(parsed.enabled),
      font: parsed.font === '1' || parsed.font === '2' || parsed.font === '3' ? parsed.font : '2',
      theme: parsed.theme === 'bw' || parsed.theme === 'wb' || parsed.theme === 'by' ? parsed.theme : 'bw',
      images: parsed.images !== false,
    }
  } catch {
    return defaultVisionState
  }
}

export function saveVisionState(state: VisionState) {
  try {
    localStorage.setItem(VISION_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

/** Синхронная инициализация до гидратации (см. VisionAccessibilityInit). */
export const visionInitScript = `(function(){try{var k=${JSON.stringify(VISION_STORAGE_KEY)};var r=localStorage.getItem(k);if(!r)return;var s=JSON.parse(r);if(!s.enabled)return;var d=document.documentElement;d.setAttribute('data-vision','on');if(s.font)d.setAttribute('data-vision-font',s.font);if(s.theme)d.setAttribute('data-vision-theme',s.theme);d.setAttribute('data-vision-images',s.images===false?'off':'on');}catch(e){}})();`
