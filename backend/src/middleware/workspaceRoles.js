import { query } from '../config/db.js';

const ROLE_ORDER = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3
};

/**
 * Ensures the current user has at least the given role in the workspace.
 * Reads workspaceId from route params (workspaceId) or body.
 */
export function requireWorkspaceRole(minRole) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const workspaceId =
        Number(req.params.workspaceId) ||
        Number(req.params.id) ||
        Number(req.body.workspaceId);

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'workspaceId required' });
      }

      const rows = await query(
        'SELECT role FROM workspace_members WHERE user_id = ? AND workspace_id = ?',
        [userId, workspaceId]
      );

      if (rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Not a member of workspace' });
      }

      const role = rows[0].role;
      if (ROLE_ORDER[role] < ROLE_ORDER[minRole]) {
        return res.status(403).json({ success: false, message: 'Insufficient workspace role' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

