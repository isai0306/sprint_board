import { query } from '../config/db.js';
import crypto from 'crypto';
import { hashPassword } from '../utils/password.js';
import { sendEmailMock } from '../utils/emailMock.js';

export async function listWorkspacesForUser(userId) {
  return query(
    `SELECT w.id, w.name, w.description, wm.role
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId]
  );
}

export async function createWorkspace(ownerId, { name, description }) {
  const result = await query(
    'INSERT INTO workspaces (name, description, owner_id) VALUES (?, ?, ?)',
    [name, description || null, ownerId]
  );
  const workspaceId = result.insertId;

  await query(
    'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)',
    [workspaceId, ownerId, 'ADMIN']
  );

  const [workspace] = await query(
    'SELECT id, name, description FROM workspaces WHERE id = ?',
    [workspaceId]
  );
  workspace.role = 'ADMIN';
  return workspace;
}

export async function listWorkspaceMembers(workspaceId) {
  return query(
    `SELECT u.id, u.name, u.email, u.avatar_url, wm.role
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     WHERE wm.workspace_id = ?
     ORDER BY wm.role DESC, u.name ASC`,
    [workspaceId]
  );
}

export async function updateWorkspace(workspaceId, userId, { name, description }) {
  // only admins of the workspace can update it
  const rows = await query(
    `SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?`,
    [workspaceId, userId]
  );
  if (rows.length === 0 || rows[0].role !== 'ADMIN') {
    const err = new Error('Only workspace admins can update workspace');
    err.status = 403;
    throw err;
  }

  await query(
    `UPDATE workspaces
     SET name = COALESCE(?, name),
         description = COALESCE(?, description)
     WHERE id = ?`,
    [name ?? null, description ?? null, workspaceId]
  );

  const [workspace] = await query(
    'SELECT id, name, description FROM workspaces WHERE id = ?',
    [workspaceId]
  );
  workspace.role = 'ADMIN';
  return workspace;
}

export async function deleteWorkspace(workspaceId, userId) {
  const rows = await query(
    `SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?`,
    [workspaceId, userId]
  );
  if (rows.length === 0 || rows[0].role !== 'ADMIN') {
    const err = new Error('Only workspace admins can delete workspace');
    err.status = 403;
    throw err;
  }

  await query('DELETE FROM workspaces WHERE id = ?', [workspaceId]);
}

export async function inviteWorkspaceMember(workspaceId, inviterId, { email, role }) {
  const inviterRows = await query(
    `SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?`,
    [workspaceId, inviterId]
  );
  if (inviterRows.length === 0 || inviterRows[0].role !== 'ADMIN') {
    const err = new Error('Only workspace admins can invite members');
    err.status = 403;
    throw err;
  }

  let users = await query(
    `SELECT id, name, email, avatar_url FROM users WHERE email = ?`,
    [email]
  );

  if (users.length === 0) {
    const tempPassword = crypto.randomBytes(24).toString('hex');
    const passwordHash = await hashPassword(tempPassword);
    const inferredName = email.split('@')[0] || 'Invited User';

    const created = await query(
      `INSERT INTO users (email, password_hash, name, global_role, is_email_verified)
       VALUES (?, ?, ?, 'USER', 0)`,
      [email, passwordHash, inferredName]
    );

    users = await query(
      `SELECT id, name, email, avatar_url FROM users WHERE id = ?`,
      [created.insertId]
    );

    await sendEmailMock({
      to: email,
      subject: 'You were invited to a Sprint Board workspace',
      html: `<p>Hello ${inferredName},</p>
             <p>You have been invited to collaborate in a workspace.</p>
             <p>Please register/login with this email to access your invitation.</p>`
    });
  }

  const user = users[0];
  const existing = await query(
    `SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?`,
    [workspaceId, user.id]
  );
  if (existing.length > 0) {
    const err = new Error('User is already a member of this workspace');
    err.status = 409;
    throw err;
  }

  await query(
    `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)`,
    [workspaceId, user.id, role]
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    role
  };
}


