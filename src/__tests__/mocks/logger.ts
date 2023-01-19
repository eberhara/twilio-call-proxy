export const loggerMock = {
  __esModule: true,
  baseLogger: {
    child: () => ({
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      silly: jest.fn()
    })
  }
}
