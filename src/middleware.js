export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function errorHandler(error, req, res, _next) {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'A record with the same unique value already exists.' });
  }

  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }

  const status = error.statusCode || 400;
  return res.status(status).json({ error: error.message || 'Unexpected error.' });
}
