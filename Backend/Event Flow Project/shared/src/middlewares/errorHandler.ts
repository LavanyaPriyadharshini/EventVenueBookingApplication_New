import { ErrorRequestHandler } from 'express';

// Two concurrent requests can both pass an app-level "does this already exist?" check before
// either writes — only the DB's unique index actually catches the second one, as a duplicate-key
// error (code 11000). Without this, that race surfaces as a raw 500 instead of a clean 409.
export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return res.status(409).json({ status: 'fail', message: `That ${field} is already in use.` });
  }

  err.statusCode ??= 500;
  err.status ??= 'error';
  res.status(err.statusCode).json({ status: err.status, message: err.message });
};
