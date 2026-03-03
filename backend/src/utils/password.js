import bcrypt from 'bcrypt';
import { config } from '../config/index.js';

export async function hashPassword(plainPassword) {
  const saltRounds = config.security.bcryptSaltRounds;
  return bcrypt.hash(plainPassword, saltRounds);
}

export async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

