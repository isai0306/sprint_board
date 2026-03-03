import crypto from 'crypto';
import { query } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';
import { sendEmailMock } from '../utils/emailMock.js';

/**
 * Creates a new user account and sends a mock email verification link.
 */
export async function registerUser({ name, email, password }) {
  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  const result = await query(
    `INSERT INTO users (name, email, password_hash, email_verification_token)
     VALUES (?, ?, ?, ?)`,
    [name, email, passwordHash, emailVerificationToken]
  );

  const userId = result.insertId;

  await sendEmailMock({
    to: email,
    subject: 'Verify your Sprint Board account',
    html: `<p>Hello ${name},</p>
           <p>Please verify your email by visiting this token (mock implementation):</p>
           <p><code>${emailVerificationToken}</code></p>`
  });

  const accessToken = signAccessToken({
    sub: userId,
    email,
    globalRole: 'USER'
  });

  return {
    user: {
      id: userId,
      name,
      email,
      avatarUrl: null,
      globalRole: 'USER',
      isEmailVerified: 0
    },
    accessToken
  };
}

/**
 * Authenticates a user with email and password and returns a JWT access token.
 */
export async function loginUser({ email, password }) {
  const rows = await query(
    'SELECT id, name, email, password_hash, avatar_url, global_role, is_email_verified FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const user = rows[0];
  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    globalRole: user.global_role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      globalRole: user.global_role,
      isEmailVerified: user.is_email_verified
    },
    accessToken
  };
}

/**
 * Marks a user's email as verified based on a verification token.
 */
export async function verifyEmail({ token }) {
  const rows = await query(
    'SELECT id, name, email FROM users WHERE email_verification_token = ?',
    [token]
  );

  if (rows.length === 0) {
    const err = new Error('Invalid or expired verification token');
    err.status = 400;
    throw err;
  }

  const user = rows[0];

  await query(
    `UPDATE users
     SET is_email_verified = 1,
         email_verification_token = NULL
     WHERE id = ?`,
    [user.id]
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

/**
 * Starts a forgot-password flow by issuing a reset token and sending a mock email.
 */
export async function requestPasswordReset({ email }) {
  const rows = await query('SELECT id, name, email FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return;
  }

  const user = rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await query(
    `UPDATE users
     SET reset_password_token = ?, reset_password_expires_at = ?
     WHERE id = ?`,
    [token, expiresAt, user.id]
  );

  await sendEmailMock({
    to: user.email,
    subject: 'Reset your Sprint Board password',
    html: `<p>Hello ${user.name},</p>
           <p>Use the following token to reset your password (mock implementation):</p>
           <p><code>${token}</code></p>`
  });
}

/**
 * Resets a user's password using a valid reset token.
 */
export async function resetPassword({ token, newPassword }) {
  const now = new Date();
  const rows = await query(
    `SELECT id FROM users
     WHERE reset_password_token = ?
       AND reset_password_expires_at IS NOT NULL
       AND reset_password_expires_at > ?`,
    [token, now]
  );

  if (rows.length === 0) {
    const err = new Error('Invalid or expired password reset token');
    err.status = 400;
    throw err;
  }

  const user = rows[0];
  const passwordHash = await hashPassword(newPassword);

  await query(
    `UPDATE users
     SET password_hash = ?,
         reset_password_token = NULL,
         reset_password_expires_at = NULL
     WHERE id = ?`,
    [passwordHash, user.id]
  );
}

/**
 * Updates the current user's profile details (name, avatar, password).
 */
export async function updateProfile(userId, { name, avatarUrl, currentPassword, newPassword }) {
  const rows = await query(
    'SELECT id, name, email, avatar_url, password_hash, global_role, is_email_verified FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const user = rows[0];
  let passwordHash = user.password_hash;

  if (newPassword) {
    if (!currentPassword) {
      const err = new Error('Current password is required to set a new password');
      err.status = 400;
      throw err;
    }

    const match = await comparePassword(currentPassword, user.password_hash);
    if (!match) {
      const err = new Error('Current password is incorrect');
      err.status = 400;
      throw err;
    }

    passwordHash = await hashPassword(newPassword);
  }

  const updatedName = name ?? user.name;
  const updatedAvatarUrl = avatarUrl ?? user.avatar_url;

  await query(
    `UPDATE users
     SET name = ?, avatar_url = ?, password_hash = ?
     WHERE id = ?`,
    [updatedName, updatedAvatarUrl, passwordHash, user.id]
  );

  return {
    id: user.id,
    name: updatedName,
    email: user.email,
    avatarUrl: updatedAvatarUrl,
    globalRole: user.global_role,
    isEmailVerified: user.is_email_verified
  };
}

