import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'clubhub-development-secret';
const jwtExpiry = '8h';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      student_id: user.student_id,
      managed_club_id: user.managed_club_id
    },
    jwtSecret,
    { expiresIn: jwtExpiry }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}
