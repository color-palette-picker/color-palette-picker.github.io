import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Shuffle } from 'lucide-react'
import { generateRandomColor } from '../utils/colors'

interface ColorPickerPopoverProps {
  color: string
  onChange: (color: string) => void
  onClose: () => void
}

export default function ColorPickerPopover({ color, onChange, onClose }: ColorPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [hexInput, setHexInput] = useState(color.slice(1).toUpperCase())

  useEffect(() => {
    setHexInput(color.slice(1).toUpperCase())
  }, [color])

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [onClose])

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase()
    setHexInput(raw)
    if (raw.length === 6) {
      onChange(`#${raw.toLowerCase()}`)
    }
  }

  const handleHexBlur = () => {
    if (hexInput.length !== 6) {
      setHexInput(color.slice(1).toUpperCase())
    }
  }

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-28 left-1/2 z-50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
      style={{
        transform: 'translateX(-50%)',
        width: '212px',
        background: 'rgba(20, 20, 24, 0.98)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <HexColorPicker color={color} onChange={onChange} />

      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>#</span>
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInput}
          onBlur={handleHexBlur}
          className="flex-1 bg-transparent text-sm font-mono outline-none uppercase"
          style={{ color: 'rgba(255,255,255,0.9)', caretColor: 'white' }}
          maxLength={6}
          spellCheck={false}
        />
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-white/20"
          style={{ background: color }}
        />
      </div>

      <button
        onClick={() => onChange(generateRandomColor())}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs transition-colors"
        style={{
          color: 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.04)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      >
        <Shuffle className="w-3 h-3" />
        Random
      </button>
    </div>
  )
}
