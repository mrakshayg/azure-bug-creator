export const logger = {
  info: (...args: unknown[]) => console.log('[api]', ...args),
  error: (...args: unknown[]) => console.error('[api]', ...args),
}
