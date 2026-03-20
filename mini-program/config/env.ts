import fs from 'node:fs'
import path from 'node:path'

type MiniEnvMap = Record<string, string>

const ENV_FILE_CANDIDATES = {
  development: ['.env.dev', '.env.development'],
  production: ['.env.prod', '.env.production']
} as const

function parseEnvContent(content: string): MiniEnvMap {
  const entries: MiniEnvMap = {}

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex <= 0) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries[key] = value
  })

  return entries
}

function readEnvFile(filePath: string): MiniEnvMap {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return parseEnvContent(fs.readFileSync(filePath, 'utf8'))
}

export function loadMiniProgramEnv(mode: string | undefined): MiniEnvMap {
  const envDir = path.resolve(__dirname, '..')
  const fileCandidates = mode === 'production'
    ? ENV_FILE_CANDIDATES.production
    : ENV_FILE_CANDIDATES.development

  const mergedEnv = fileCandidates.reduce<MiniEnvMap>((acc, fileName) => {
    return {
      ...acc,
      ...readEnvFile(path.join(envDir, fileName))
    }
  }, {})

  Object.entries(mergedEnv).forEach(([key, value]) => {
    if (typeof process.env[key] === 'undefined' || process.env[key] === '') {
      process.env[key] = value
    }
  })

  return mergedEnv
}

export function toDefineConstantMap(env: MiniEnvMap) {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
  )
}
