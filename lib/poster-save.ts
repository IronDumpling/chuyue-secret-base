// How "Save Poster" reaches the person's photo library. A web page cannot write to Photos;
// on iOS the share sheet's "Save Image" can, so there we share the file. Android's share
// sheet usually has no such entry and its downloads already show in the gallery, so every
// other device keeps the plain download. Client-safe: no DOM access here, callers pass it in.

export interface SaveEnv {
  userAgent: string
  platform: string
  maxTouchPoints: number
  canShareFiles: boolean
}

export function isIOS(env: Pick<SaveEnv, 'userAgent' | 'platform' | 'maxTouchPoints'>): boolean {
  if (/iPhone|iPad|iPod/.test(env.userAgent)) return true
  // iPadOS reports itself as a Mac; only the touch screen gives it away.
  return env.platform === 'MacIntel' && env.maxTouchPoints > 1
}

export function posterSaveMode(env: SaveEnv): 'share' | 'download' {
  return isIOS(env) && env.canShareFiles ? 'share' : 'download'
}

// The person closing the share sheet is a choice, not a failure.
export function shouldFallbackToDownload(error: unknown): boolean {
  return !(error && typeof error === 'object' && (error as { name?: string }).name === 'AbortError')
}
