import { query } from '../config/db.js';

export async function listBoardsForUser(userId) {
  return query(
    `SELECT b.id, b.name, b.description, b.workspace_id, b.updated_at
     FROM boards b
     JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
     WHERE wm.user_id = ? AND b.is_archived = 0
     ORDER BY b.updated_at DESC`,
    [userId]
  );
}

export async function createBoard(userId, { workspaceId, name, description }) {
  const result = await query(
    'INSERT INTO boards (workspace_id, name, description, created_by) VALUES (?, ?, ?, ?)',
    [workspaceId, name, description || null, userId]
  );
  const boardId = result.insertId;

  // Create default columns for new board
  await query(
    `INSERT INTO lists (board_id, title, position)
     VALUES (?, 'To Do', 0), (?, 'In Progress', 1), (?, 'Done', 2)`,
    [boardId, boardId, boardId]
  );

  const [board] = await query(
    'SELECT id, name, description, workspace_id, updated_at FROM boards WHERE id = ?',
    [boardId]
  );
  return board;
}

export async function getBoardWithLists(boardId, userId) {
  const boards = await query(
    `SELECT b.id, b.name, b.description, b.workspace_id
     FROM boards b
     JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
     WHERE b.id = ? AND wm.user_id = ?`,
    [boardId, userId]
  );

  if (boards.length === 0) {
    const err = new Error('Board not found');
    err.status = 404;
    throw err;
  }

  const board = boards[0];

  const lists = await query(
    `SELECT id, title, position
     FROM lists
     WHERE board_id = ?
     ORDER BY position ASC, id ASC`,
    [boardId]
  );

  const cards = await query(
    `SELECT c.id, c.title, c.description, c.priority, c.due_date,
            c.list_id, c.assigned_to, c.position, u.name AS assignee_name
     FROM cards c
     LEFT JOIN users u ON u.id = c.assigned_to
     WHERE c.list_id IN (SELECT id FROM lists WHERE board_id = ?)
     ORDER BY c.position ASC, c.id ASC`,
    [boardId]
  );

  return { board, lists, cards };
}

export async function createList({ boardId, title, position }) {
  const result = await query(
    'INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)',
    [boardId, title, position ?? 0]
  );
  const [list] = await query('SELECT id, title, position FROM lists WHERE id = ?', [
    result.insertId
  ]);
  return list;
}

export async function createCard({
  listId,
  title,
  description,
  priority,
  dueDate,
  assigneeId,
  createdBy,
  position
}) {
  const result = await query(
    `INSERT INTO cards (list_id, title, description, priority, due_date, assigned_to, position, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      listId,
      title,
      description || null,
      priority || 'MEDIUM',
      dueDate || null,
      assigneeId ?? null,
      position ?? 0,
      createdBy ?? null
    ]
  );

  const [card] = await query(
    `SELECT c.id, c.title, c.description, c.priority, c.due_date, c.list_id,
            c.assigned_to, c.position, u.name AS assignee_name
     FROM cards c
     LEFT JOIN users u ON u.id = c.assigned_to
     WHERE c.id = ?`,
    [result.insertId]
  );
  return card;
}

export async function moveCard({ cardId, toListId, position }) {
  await query(
    'UPDATE cards SET list_id = ?, position = ? WHERE id = ?',
    [toListId, position, cardId]
  );
  const [card] = await query(
    `SELECT c.id, c.title, c.description, c.priority, c.due_date,
            c.list_id, c.assigned_to, c.position, u.name AS assignee_name
     FROM cards c
     LEFT JOIN users u ON u.id = c.assigned_to
     WHERE c.id = ?`,
    [cardId]
  );
  return card;
}

export async function updateBoard(boardId, userId, { name, description }) {
  // ensure user can see the board
  const boards = await query(
    `SELECT b.id
     FROM boards b
     JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
     WHERE b.id = ? AND wm.user_id = ?`,
    [boardId, userId]
  );
  if (boards.length === 0) {
    const err = new Error('Board not found or access denied');
    err.status = 404;
    throw err;
  }

  await query(
    `UPDATE boards
     SET name = COALESCE(?, name),
         description = COALESCE(?, description)
     WHERE id = ?`,
    [name ?? null, description ?? null, boardId]
  );

  const [board] = await query(
    'SELECT id, name, description, workspace_id, updated_at FROM boards WHERE id = ?',
    [boardId]
  );
  return board;
}

export async function archiveBoard(boardId, userId) {
  const boards = await query(
    `SELECT b.id
     FROM boards b
     JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
     WHERE b.id = ? AND wm.user_id = ?`,
    [boardId, userId]
  );
  if (boards.length === 0) {
    const err = new Error('Board not found or access denied');
    err.status = 404;
    throw err;
  }

  await query('UPDATE boards SET is_archived = 1 WHERE id = ?', [boardId]);
}


