import { forbidden, unauthorized } from './middleware.js';
import { verifyToken } from './services/authService.js';
import { getUserById } from './repositories/userRepository.js';

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized());
  }

  try {
    const payload = verifyToken(token);
    const user = getUserById(payload.sub);
    if (!user) return next(unauthorized('User no longer exists.'));
    req.user = user;
    return next();
  } catch {
    return next(unauthorized('Token is invalid or expired.'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(forbidden());
    }
    return next();
  };
}
