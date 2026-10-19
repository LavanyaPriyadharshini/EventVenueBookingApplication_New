import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError('Not logged in', 401));

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  (req as any).user = decoded;
  next();
});

export const restrictTo =
  (...roles: string[]) =>
  (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return next(new AppError('Forbidden', 403));
    next();
  };
