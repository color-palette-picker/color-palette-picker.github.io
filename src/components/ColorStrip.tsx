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
      className="relative flex flex-col items-center justify-end pb-10 cursor-pointer select-none transition-[flex] duration-300 ease-in-out"
      style={{
        flex: '1 1 0',
        backgroundColor: color,
        minWidth: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
    >
      {/* Top controls */}
      <div
        className="absolute top-5 left-0 right-0 flex justify-center gap-2 transition-all duration-200"
        style={{ opacity: showControls ? 1 : 0, transform: showControls ? 'translateY(0)' : 'translateY(-4px)' }}
      >
        {canDelete && (
          <button
            className="p-2 rounded-xl transition-colors duration-150"
            style={{
              background: fg === '#ffffff' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)',
              color: fg,
            }}
            onClick={e => { e.stopPropagation(); onDelete() }}
            aria-label="Delete color"
            onMouseEnter={e => (e.currentTarget.style.background = fg === '#ffffff' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.background = fg === '#ffffff' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div
        className="flex flex-col items-center gap-2 transition-all duration-200"
        style={{ opacity: showControls ? 1 : 0.55, transform: showControls ? 'translateY(0)' : 'translateY(4px)' }}
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
            background: fg === '#ffffff' ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)',
            opacity: showControls ? 1 : 0,
          }}
          onClick={copyHex}
          onMouseEnter={e => (e.currentTarget.style.background = fg === '#ffffff' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.38)')}
          onMouseLeave={e => (e.currentTarget.style.background = fg === '#ffffff' ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)')}
          aria-label="Copy hex code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
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
