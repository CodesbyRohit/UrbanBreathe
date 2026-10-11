// Consistent JSON errors: { error: { code, message, details? } }.
// Internal error messages and stack traces are never sent to clients.

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (code, message, details) => new HttpError(400, code, message, details);
export const notFound = (code, message, details) => new HttpError(404, code, message, details);
export const upstreamUnavailable = (message, details) =>
  new HttpError(503, 'UPSTREAM_UNAVAILABLE', message, details);

export function sendError(res, status, code, message, details) {
  const body = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  res.status(status).json(body);
}

/** Wrap an async route handler so rejections reach the error middleware. */
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** 404 for unknown /api routes. */
export function apiNotFound(req, res) {
  sendError(res, 404, 'ROUTE_NOT_FOUND', `No API route for ${req.method} ${req.path}`);
}

/** Final error middleware. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }
  if (err?.type === 'entity.parse.failed') {
    return sendError(res, 400, 'INVALID_JSON', 'Request body is not valid JSON.');
  }
  if (err?.type === 'entity.too.large') {
    return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }
  console.error(`[api] ${req.method} ${req.path} failed:`, err);
  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
}
