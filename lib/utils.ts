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
 * This function ensures proper path joining for static exports with basePath
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
  // Remove trailing slash from basePath if present
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  
  // Return combined path
  return cleanBasePath ? `${cleanBasePath}${normalizedPath}` : normalizedPath
}

