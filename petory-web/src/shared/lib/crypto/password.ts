import { env } from '@/shared/config/env'

const textEncoder = new TextEncoder()

export async function encryptLoginPassword(password: string): Promise<string> {
  if (!env.authPasswordAesKeyBase64 || !env.authPasswordAesIvBase64) {
    throw new Error('Missing AES login encryption config.')
  }

  const keyBytes = base64ToBytes(env.authPasswordAesKeyBase64)
  const ivBytes = base64ToBytes(env.authPasswordAesIvBase64)

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
    },
    key,
    textEncoder.encode(password),
  )

  return bytesToBase64(new Uint8Array(encrypted))
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }

  return btoa(binary)
}
