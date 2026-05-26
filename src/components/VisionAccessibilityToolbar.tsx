'use client'

import type { VisionFontLevel, VisionTheme } from '@/lib/visionAccessibility'

import { useVisionAccessibility } from './VisionAccessibilityProvider'

const headerShell = 'mx-auto w-full max-w-5xl px-4'

const themes: { id: VisionTheme; label: string; short: string }[] = [
  { id: 'bw', label: 'Чёрный на белом', short: 'Ц' },
  { id: 'wb', label: 'Белый на чёрном', short: 'Б' },
  { id: 'by', label: 'Чёрный на жёлтом', short: 'Ж' },
]

const fonts: { id: VisionFontLevel; label: string }[] = [
  { id: '1', label: 'А' },
  { id: '2', label: 'А+' },
  { id: '3', label: 'А++' },
]

const BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '34px',
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: 1,
  borderRadius: '6px',
  border: '1px solid #999',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s, color 0.15s',
  padding: '0 10px',
}

const SQ: React.CSSProperties = { ...BASE, width: '34px', padding: '0' }

const INACTIVE: React.CSSProperties = { background: '#ffffff', color: '#000000' }
const ACTIVE: React.CSSProperties = { background: '#000000', color: '#ffffff', borderColor: '#000000' }

function Btn({
  active,
  square,
  onClick,
  children,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
}: {
  active?: boolean
  square?: boolean
  onClick: () => void
  children: React.ReactNode
  'aria-label'?: string
  'aria-pressed'?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      style={{ ...(square ? SQ : BASE), ...(active ? ACTIVE : INACTIVE) }}
    >
      {children}
    </button>
  )
}

export function VisionAccessibilityToolbar() {
  const { enabled, font, theme, images, disable, setFont, setTheme, toggleImages } = useVisionAccessibility()

  if (!enabled) return null

  return (
    <div
      data-vision-panel
      style={{
        background: '#ffffff',
        color: '#000000',
        borderBottom: '1px solid #000000',
        fontSize: '13px',
        lineHeight: '1.25',
      }}
      role="region"
      aria-label="Настройки версии для слабовидящих"
    >
      <div
        className={headerShell}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '13px', color: '#000000', marginRight: '4px', flexShrink: 0 }}>
          Версия для слабовидящих
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} role="group" aria-label="Размер шрифта">
          {fonts.map((f) => (
            <Btn
              key={f.id}
              square
              active={font === f.id}
              onClick={() => setFont(f.id)}
              aria-label={`Размер шрифта: ${f.label}`}
              aria-pressed={font === f.id}
            >
              {f.label}
            </Btn>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} role="group" aria-label="Цветовая схема">
          {themes.map((t) => (
            <Btn
              key={t.id}
              square
              active={theme === t.id}
              onClick={() => setTheme(t.id)}
              aria-label={t.label}
              aria-pressed={theme === t.id}
            >
              {t.short}
            </Btn>
          ))}
        </div>

        <Btn active={!images} onClick={toggleImages} aria-pressed={!images}>
          {images ? 'Скрыть изображения' : 'Показать изображения'}
        </Btn>

        <div style={{ marginLeft: 'auto' }}>
          <Btn onClick={disable}>Обычная версия</Btn>
        </div>
      </div>
    </div>
  )
}
