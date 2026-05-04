import { useState, useEffect, useCallback } from 'react'
import { Shuffle, Share2, Plus, Check } from 'lucide-react'
import ColorStrip from './components/ColorStrip'
import { decodeColors, encodeColors, generateRandomColor, generatePalette } from './utils/colors'

const DEFAULT_COLORS = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']

function getInitialColors(): string[] {
  const hash = window.location.hash.slice(1)
  if (hash) {
    const decoded = decodeColors(hash)
    if (decoded.length > 0) return decoded
  }
  return DEFAULT_COLORS
}

export default function App() {
  const [colors, setColors] = useState<string[]>(getInitialColors)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const encoded = encodeColors(colors)
    window.history.replaceState(null, '', `#${encoded}`)
  }, [colors])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const decoded = decodeColors(hash)
        if (decoded.length > 0) setColors(decoded)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const addColor = useCallback(() => {
    setColors(prev => [...prev, generateRandomColor()])
  }, [])

  const deleteColor = useCallback((index: number) => {
    setColors(prev => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
    setActiveIndex(null)
  }, [])

  const updateColor = useCallback((index: number, color: string) => {
    setColors(prev => prev.map((c, i) => (i === index ? color : c)))
  }, [])

  const randomizeAll = useCallback(() => {
    setColors(prev => generatePalette(prev.length))
    setActiveIndex(null)
  }, [])

  const shareUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      const el = document.createElement('input')
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleStripActivate = useCallback((index: number) => {
    setActiveIndex(prev => (prev === index ? null : index))
  }, [])

  const handleStripDeactivate = useCallback(() => {
    setActiveIndex(null)
  }, [])

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden" style={{ background: '#0d0d10' }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
        style={{
          height: '52px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(13,13,16,0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-0.5 rounded-md overflow-hidden flex-shrink-0" style={{ width: 24, height: 24 }}>
            {['#264653', '#2a9d8f', '#e9c46a', '#e76f51'].map(c => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>
          <span className="hidden sm:block text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Color Palette Generator
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs mr-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {colors.length} color{colors.length !== 1 ? 's' : ''}
          </span>

          {/* Generate — icon-only on mobile */}
          <button
            onClick={randomizeAll}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 touch-manipulation"
            style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            aria-label="Generate new palette"
          >
            <Shuffle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Generate</span>
          </button>

          {/* Share */}
          <button
            onClick={shareUrl}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 touch-manipulation"
            style={{
              color: copied ? '#4ade80' : 'rgba(255,255,255,0.9)',
              background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.12)',
              border: '1px solid',
              borderColor: copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
            aria-label="Copy shareable URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Share2 className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* ── Palette ──
          flex-col on mobile (horizontal strips stack vertically, scroll if many)
          flex-row on desktop (vertical strips side by side)                      */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto sm:overflow-hidden">
        {colors.map((color, index) => (
          <ColorStrip
            key={index}
            color={color}
            isActive={activeIndex === index}
            onActivate={() => handleStripActivate(index)}
            onDeactivate={handleStripDeactivate}
            onDelete={() => deleteColor(index)}
            onChange={c => updateColor(index, c)}
            canDelete={colors.length > 1}
          />
        ))}

        {/* ── Add Color button — desktop (right panel) ── */}
        <button
          onClick={addColor}
          className="hidden sm:flex flex-col items-center justify-center gap-3 flex-shrink-0 transition-colors duration-200 touch-manipulation"
          style={{
            width: '96px',
            borderLeft: '1px dashed rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.02)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          aria-label="Add color"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
            style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Add Color
          </span>
        </button>

        {/* ── Add Color button — mobile (bottom row) ── */}
        <button
          onClick={addColor}
          className="flex sm:hidden flex-shrink-0 items-center justify-center gap-2.5 transition-colors duration-150 touch-manipulation"
          style={{
            height: '64px',
            borderTop: '1px dashed rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.02)',
          }}
          onTouchStart={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onTouchEnd={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          aria-label="Add color"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Add Color
          </span>
        </button>
      </div>

      {/* ── Footer hint ── */}
      <div
        className="flex items-center justify-center flex-shrink-0 text-xs px-4 text-center"
        style={{
          height: '28px',
          color: 'rgba(255,255,255,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <span className="hidden sm:block">Click any color to edit · Hover to copy or delete · Share button copies URL</span>
        <span className="sm:hidden">Tap a color to edit · Share copies the URL</span>
      </div>
    </div>
  )
}
