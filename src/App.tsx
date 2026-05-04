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

  // Sync on hash change (browser back/forward)
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
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          height: '52px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(13,13,16,0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 rounded-md overflow-hidden" style={{ width: 24, height: 24 }}>
            {['#264653','#2a9d8f','#e9c46a','#e76f51'].map(c => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Color Palette Generator
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs mr-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {colors.length} color{colors.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={randomizeAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150"
            style={{
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <Shuffle className="w-3.5 h-3.5" />
            Generate
          </button>
          <button
            onClick={shareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              color: copied ? '#4ade80' : 'rgba(255,255,255,0.9)',
              background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.12)',
              border: '1px solid',
              borderColor: copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => {
              if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
            }}
            onMouseLeave={e => {
              if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </header>

      {/* Palette */}
      <div className="flex flex-1 overflow-hidden">
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

        {/* Add button */}
        <button
          onClick={addColor}
          className="flex items-center justify-center flex-shrink-0 transition-colors duration-150"
          style={{
            width: '52px',
            background: 'rgba(255,255,255,0.03)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          aria-label="Add color"
        >
          <Plus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Footer hint */}
      <div
        className="flex items-center justify-center flex-shrink-0 text-xs"
        style={{
          height: '28px',
          color: 'rgba(255,255,255,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        Click any color to edit · Hover to copy or delete · Share button copies URL
      </div>
    </div>
  )
}
