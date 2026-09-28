export type Platform = 'ios' | 'android' | 'desktop'

/** Basta con distinguir iOS de Android de escritorio: cada uno instala distinto. */
export function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  if (iOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

/** Safari es el único navegador iOS real: el resto son Safari con otro traje (política de Apple). */
export function isIosSafari(): boolean {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
}
