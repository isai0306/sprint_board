import {
  listWorkspacesForUser,
  createWorkspace,
  listWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  inviteWorkspaceMember
} from '../services/workspaceService.js';

export async function getMyWorkspacesController(req, res, next) {
  try {
    const workspaces = await listWorkspacesForUser(req.user.id);
    return res.json({ success: true, workspaces });
  } catch (err) {
    return next(err);
  }
}

export async function createWorkspaceController(req, res, next) {
  try {
    const workspace = await createWorkspace(req.user.id, req.body);
    return res.status(201).json({ success: true, workspace });
  } catch (err) {
    return next(err);
  }
}

export async function listMembersController(req, res, next) {
  try {
    const members = await listWorkspaceMembers(Number(req.params.id));
    return res.json({ success: true, members });
  } catch (err) {
    return next(err);
  }
}

export async function updateWorkspaceController(req, res, next) {
  try {
    const workspace = await updateWorkspace(
      Number(req.params.id),
      req.user.id,
      req.body
    );
    return res.json({ success: true, workspace });
  } catch (err) {
    return next(err);
  }
}

export async function deleteWorkspaceController(req, res, next) {
  try {
    await deleteWorkspace(Number(req.params.id), req.user.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
}

export async function inviteWorkspaceMemberController(req, res, next) {
  try {
    const member = await inviteWorkspaceMember(
      Number(req.params.id),
      req.user.id,
      req.body
    );
    return res.status(201).json({ success: true, member });
  } catch (err) {
    return next(err);
  }
}


