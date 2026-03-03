import { query } from '../config/db.js';

export async function getUserDashboard(userId) {
  const workspaces = await query(
    `SELECT w.id, w.name, w.description, w.created_at
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = ?
     ORDER BY w.created_at DESC
     LIMIT 10`,
    [userId]
  );

  const boards = await query(
    `SELECT b.id, b.name, b.description, b.workspace_id, b.created_at
     FROM boards b
     JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
     WHERE wm.user_id = ? AND b.is_archived = 0
     ORDER BY b.created_at DESC
     LIMIT 20`,
    [userId]
  );

  const [stats] = await query(
    `SELECT
        COUNT(*) AS totalTasks,
        SUM(CASE WHEN c.is_archived = 1 THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN c.due_date IS NOT NULL AND c.due_date < NOW() AND c.is_archived = 0 THEN 1 ELSE 0 END) AS overdueTasks
     FROM cards c
     JOIN lists l ON l.id = c.list_id
     JOIN boards b ON b.id = l.board_id
     JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
     WHERE wm.user_id = ?`,
    [userId]
  );

  return {
    workspaces,
    boards,
    stats: {
      totalTasks: Number(stats?.totalTasks || 0),
      completedTasks: Number(stats?.completedTasks || 0),
      overdueTasks: Number(stats?.overdueTasks || 0)
    }
  };
}

