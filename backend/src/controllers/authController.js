import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  updateProfile
} from '../services/authService.js';

/**
 * Controller that handles user registration.
 */
export async function registerController(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken } = await registerUser({ name, email, password });
    return res.status(201).json({ success: true, user, accessToken });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller that handles user login.
 */
export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken } = await loginUser({ email, password });
    return res.json({ success: true, user, accessToken });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller that verifies a user's email address.
 */
export async function verifyEmailController(req, res, next) {
  try {
    const { token } = req.body;
    const user = await verifyEmail({ token });
    return res.json({ success: true, user });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller that starts the password reset process.
 */
export async function requestPasswordResetController(req, res, next) {
  try {
    const { email } = req.body;
    await requestPasswordReset({ email });
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent (mock)'
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller that completes the password reset using a token.
 */
export async function resetPasswordController(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    await resetPassword({ token, newPassword });
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller that returns the current user's profile.
 */
export async function meController(req, res, next) {
  try {
    const user = req.user;
    return res.json({ success: true, user });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller that updates the authenticated user's profile details.
 */
export async function updateProfileController(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const updated = await updateProfile(userId, {
      name,
      avatarUrl,
      currentPassword,
      newPassword
    });
    return res.json({ success: true, user: updated });
  } catch (err) {
    return next(err);
  }
}

