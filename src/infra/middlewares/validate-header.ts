import { Request, Response, NextFunction } from 'express'

export const validateHeader = (header: string, value: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.header(header) || req.header(header) !== value) return res.sendStatus(403)
  return next()
}
