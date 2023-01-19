import { bool, cleanEnv, port, str, num } from 'envalid'

const env = cleanEnv(process.env, {
  AUDIO_PROXY_PORT: port({ default: 8999 }),
  NODE_ENV: str({ default: 'production' }),
  ENV: str({ default: 'local' }),
  ENABLE_DEBUG_ROUTES: bool({ default: false }),
  REMOTE_CACHE_ENABLED: bool({ default: false }),
  REDIS_HOST: str({ default: '' }),
  SERVER_API_KEY: str({ default: '' }),
  SERVER_API_HOST: str({ default: '' }),
  SERVER_API_TIMEOUT_MS: num({ default: 10000 }),
  TWILIO_AUTH_TOKEN: str({ default: '' }),
  VALIDATE_EXTERNAL_CALLS: bool({ default: false }),
  INVALID_AUTH_ATTEMPTS_ALLOWED: num({ default: 9 }),
  INVALID_AUTH_ATTEMPTS_CACHE_TTL_SECONDS: num({ default: 86400 /* 1 day */ }),
  SENTRY_DSN: str({ default: '' }),
  SENTRY_TRACE_SAMPLE_RATE: num({ default: 1.0 })
})

export default env
