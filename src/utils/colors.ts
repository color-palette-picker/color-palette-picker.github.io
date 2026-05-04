export function encodeColors(colors: string[]): string {
  return colors.map(c => c.replace('#', '').toLowerCase()).join('-')
}

export function decodeColors(encoded: string): string[] {
  const cleaned = encoded.replace(/^#/, '')
  if (!cleaned) return []
  const parts = cleaned.split('-')
  const colors = parts
    .filter(p => /^[0-9a-fA-F]{6}$/.test(p))
    .map(p => `#${p.toLowerCase()}`)
  return colors
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 45 + Math.floor(Math.random() * 40)
  const lightness = 30 + Math.floor(Math.random() * 40)
  return hslToHex(hue, saturation, lightness)
}

export function generatePalette(count: number): string[] {
  // Generate harmonious colors by spacing hues evenly with some randomness
  const baseHue = Math.floor(Math.random() * 360)
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + (i * (360 / count)) + Math.floor(Math.random() * 30 - 15) + 360) % 360
    const saturation = 45 + Math.floor(Math.random() * 35)
    const lightness = 30 + Math.floor(Math.random() * 40)
    return hslToHex(hue, saturation, lightness)
  })
}

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Relative luminance (WCAG formula)
  const toLinear = (c: number) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  }
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return L > 0.35 ? '#000000' : '#ffffff'
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
