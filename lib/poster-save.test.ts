import { describe, it, expect } from 'vitest'
import { isIOS, posterSaveMode, shouldFallbackToDownload } from './poster-save'

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
const MAC_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36'

describe('posterSaveMode', () => {
  it('shares on an iPhone that can share files', () => {
    const env = { userAgent: IPHONE, platform: 'iPhone', maxTouchPoints: 5 }
    expect(posterSaveMode({ ...env, canShareFiles: true })).toBe('share')
    expect(posterSaveMode({ ...env, canShareFiles: false })).toBe('download')
  })

  it('treats iPadOS (a Mac with touch) as iOS', () => {
    expect(isIOS({ userAgent: MAC_SAFARI, platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true)
    expect(posterSaveMode({ userAgent: MAC_SAFARI, platform: 'MacIntel', maxTouchPoints: 5, canShareFiles: true })).toBe(
      'share'
    )
  })

  it('downloads on a desktop Mac and on Android', () => {
    expect(posterSaveMode({ userAgent: MAC_SAFARI, platform: 'MacIntel', maxTouchPoints: 0, canShareFiles: true })).toBe(
      'download'
    )
    expect(posterSaveMode({ userAgent: ANDROID, platform: 'Linux armv8l', maxTouchPoints: 5, canShareFiles: true })).toBe(
      'download'
    )
  })
})

describe('shouldFallbackToDownload', () => {
  it('does nothing when the person cancels, downloads on any other failure', () => {
    expect(shouldFallbackToDownload(new DOMException('', 'AbortError'))).toBe(false)
    expect(shouldFallbackToDownload(new DOMException('', 'NotAllowedError'))).toBe(true)
    expect(shouldFallbackToDownload(new Error('boom'))).toBe(true)
  })
})
