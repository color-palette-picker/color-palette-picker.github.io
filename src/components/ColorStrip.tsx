import { useState } from 'react'
import { Trash2, Copy, Check } from 'lucide-react'
import { getContrastColor, hexToHsl } from '../utils/colors'
import ColorPickerPopover from './ColorPickerPopover'

interface ColorStripProps {
  color: string
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
  onChange: (color: string) => void
  canDelete: boolean
}

export default function ColorStrip({
  color,
  isActive,
  onActivate,
  onDeactivate,
  onDelete,
  onChange,
  canDelete,
}: ColorStripProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const fg = getContrastColor(color)
  const { h, s, l } = hexToHsl(color)
  const showControls = isHovered || isActive

  const bgControl = fg === '#ffffff' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'
  const bgControlHover = fg === '#ffffff' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)'

  const copyHex = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(color.toUpperCase())
    } catch {
      const el = document.createElement('input')
      el.value = color.toUpperCase()
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{
        flex: '1 1 0',
        backgroundColor: color,
        minWidth: 0,
        minHeight: '72px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
    >
      {/* ── MOBILE: horizontal row, always-visible controls ── */}
      <div className="flex sm:hidden absolute inset-0 items-center px-4 gap-3">
        {/* Color info (tappable area to open picker) */}
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span
            className="text-sm font-mono font-semibold tracking-wide uppercase truncate"
            style={{ color: fg }}
          >
            {color.toUpperCase()}
          </span>
          <span
            className="text-xs font-mono truncate"
            style={{ color: fg, opacity: 0.5 }}
          >
            {h}° {s}% {l}%
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="p-2.5 rounded-xl touch-manipulation"
            style={{ background: bgControl, color: fg }}
            onClick={copyHex}
            onTouchStart={e => (e.currentTarget.style.background = bgControlHover)}
            onTouchEnd={e => (e.currentTarget.style.background = bgControl)}
            aria-label="Copy hex"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          {canDelete && (
            <button
              className="p-2.5 rounded-xl touch-manipulation"
              style={{ background: bgControl, color: fg }}
              onClick={e => { e.stopPropagation(); onDelete() }}
              onTouchStart={e => (e.currentTarget.style.background = bgControlHover)}
              onTouchEnd={e => (e.currentTarget.style.background = bgControl)}
              aria-label="Delete color"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── DESKTOP: vertical column, hover-reveal controls ── */}

      {/* Delete button — top center */}
      <div
        className="hidden sm:flex absolute top-5 left-0 right-0 justify-center gap-2 transition-all duration-200"
        style={{
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(-4px)',
        }}
      >
        {canDelete && (
          <button
            className="p-2 rounded-xl transition-colors duration-150"
            style={{ background: bgControl, color: fg }}
            onClick={e => { e.stopPropagation(); onDelete() }}
            aria-label="Delete color"
            onMouseEnter={e => (e.currentTarget.style.background = bgControlHover)}
            onMouseLeave={e => (e.currentTarget.style.background = bgControl)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hex info — bottom center */}
      <div
        className="hidden sm:flex absolute bottom-10 left-0 right-0 flex-col items-center gap-2 transition-all duration-200"
        style={{
          opacity: showControls ? 1 : 0.55,
          transform: showControls ? 'translateY(0)' : 'translateY(4px)',
        }}
      >
        <span
          className="text-xs font-mono font-medium tracking-widest uppercase"
          style={{ color: fg, opacity: 0.6 }}
        >
          {h}° {s}% {l}%
        </span>
        <span
          className="text-base font-mono font-semibold tracking-wider uppercase"
          style={{ color: fg }}
        >
          {color.toUpperCase()}
        </span>
        <button
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            color: fg,
            background: bgControl,
            opacity: showControls ? 1 : 0,
          }}
          onClick={copyHex}
          onMouseEnter={e => (e.currentTarget.style.background = bgControlHover)}
          onMouseLeave={e => (e.currentTarget.style.background = bgControl)}
          aria-label="Copy hex code"
        >
          {copied ? (
            <><Check className="w-3 h-3" />Copied</>
          ) : (
            <><Copy className="w-3 h-3" />Copy</>
          )}
        </button>
      </div>

      {/* Color picker popover */}
      {isActive && (
        <ColorPickerPopover
          color={color}
          onChange={onChange}
          onClose={onDeactivate}
        />
      )}
    </div>
  )
}
