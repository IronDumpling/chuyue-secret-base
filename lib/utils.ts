// Utility functions

/**
 * Get the base path for the application
 * This is used for GitHub Pages deployment
 */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || ''
}

/**
 * Add base path to a URL if it's a relative path
 * Absolute URLs (starting with http:// or https://) are returned as-is
 */
export function withBasePath(path: string): string {
  // If it's an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // If it's a relative path, add base path
  const basePath = getBasePath()
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // Combine base path and path, avoiding double slashes
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath
}

