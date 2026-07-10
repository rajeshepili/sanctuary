import {
  getExportData,
  importBackupFromJson,
} from '#/features/export/export.api'
import { buildFullBackupPayload } from '#/features/export/export.import'
import { encryptData, decryptData } from '#/utils/crypto'

export const ENCRYPTED_EXPORT_PREFIX = 'sanctuary-export-'
export const ENCRYPTED_EXPORT_EXT = '.enc'
const MAX_ENCRYPTED_EXPORTS = 5

function buildExportFileName() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${ENCRYPTED_EXPORT_PREFIX}${stamp}${ENCRYPTED_EXPORT_EXT}`
}

async function pruneOldExports(directory: string) {
  if (!window.sanctuary?.listFiles || !window.sanctuary.deleteFile) return
  const deleteFile = window.sanctuary.deleteFile

  const files = await window.sanctuary.listFiles(directory)
  const exports = files
    .filter(
      (f) =>
        f.startsWith(ENCRYPTED_EXPORT_PREFIX) &&
        f.endsWith(ENCRYPTED_EXPORT_EXT),
    )
    .sort()

  const stale = exports.slice(
    0,
    Math.max(0, exports.length - MAX_ENCRYPTED_EXPORTS),
  )
  await Promise.all(stale.map((file) => deleteFile(`${directory}/${file}`)))
}

/** Writes a passphrase-encrypted full backup into a folder you control. */
export async function createEncryptedExport(
  directory: string,
  passphrase: string,
): Promise<Date> {
  if (!window.sanctuary) {
    throw new Error('Encrypted exports are only available in the desktop app.')
  }

  const data = await getExportData()
  const payload = buildFullBackupPayload(data)
  const encrypted = await encryptData(JSON.stringify(payload), passphrase)
  const fileName = buildExportFileName()

  await window.sanctuary.writeFileStructure(directory, [
    { path: fileName, content: encrypted },
  ])

  await pruneOldExports(directory)
  return new Date()
}

/** Decrypts an export file and restores the full backup payload. */
export async function restoreEncryptedExport(
  filePath: string,
  passphrase: string,
  mode: 'merge' | 'replace',
): Promise<{ entriesImported: number; identitiesImported: number }> {
  if (!window.sanctuary?.readFileBase64) {
    throw new Error('Restore is only available in the desktop app.')
  }

  const encrypted = await window.sanctuary.readFileBase64(filePath)
  if (!encrypted) throw new Error('Could not read the export file.')

  let decrypted: string
  try {
    decrypted = await decryptData(encrypted, passphrase)
  } catch {
    throw new Error('Wrong passphrase or corrupted file.')
  }

  return importBackupFromJson({ data: { json: decrypted, mode } })
}
