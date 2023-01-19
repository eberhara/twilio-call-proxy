module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*spec.ts'],
  reporters: ['default', 'jest-junit'],
  coverageReporters: [['text']],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 94,
      lines: 98,
      functions: 96
    }
  },
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/infra/middlewares',
    '/src/infra/monitoring/'
  ],
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}
