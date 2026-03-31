import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { env } from '../config/env.js'

export function resolveUploadPath(storageKey: string) {
  return path.resolve(process.cwd(), env.UPLOAD_DIR, storageKey)
}

export async function ensureUploadDirectory() {
  await mkdir(path.resolve(process.cwd(), env.UPLOAD_DIR), { recursive: true })
}
