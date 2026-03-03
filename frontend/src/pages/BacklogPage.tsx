import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import '../styles/backlog.css';

type BacklogTask = {
  id: number;
  title: string;
  priority: string;
  boardId: number;
  boardName: string;
  listTitle: string;
  assigneeName: string | null;
  dueDate: string | null;
};

export const BacklogPage: React.FC = () => {
  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const boardsRes = await apiClient.get('/boards');
        const boards = Array.isArray(boardsRes.data?.boards) ? boardsRes.data.boards : [];
        const details = await Promise.all(
          boards.map((b: any) => apiClient.get(`/boards/${b.id}`))
        );

        if (!mounted) return;
        const rows: BacklogTask[] = [];
        for (const detail of details) {
          const board = detail.data?.board;
          const lists = Array.isArray(detail.data?.lists) ? detail.data.lists : [];
          const listMap = new Map<number, string>(
            lists.map((l: any) => [l.id, l.title])
          );
          const cards = Array.isArray(detail.data?.cards) ? detail.data.cards : [];
          for (const c of cards) {
            rows.push({
              id: c.id,
              title: c.title,
              priority: c.priority || 'MEDIUM',
              boardId: board.id,
              boardName: board.name,
              listTitle: listMap.get(c.list_id) || 'Unknown',
              assigneeName: c.assignee_name || null,
              dueDate: c.due_date || null
            });
          }
        }
        setTasks(rows);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load backlog');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, BacklogTask[]>();
    tasks.forEach((t) => {
      if (!map.has(t.boardName)) map.set(t.boardName, []);
      map.get(t.boardName)!.push(t);
    });
    return Array.from(map.entries());
  }, [tasks]);

  return (
    <div className="backlog-page">
      <div className="backlog-head">
        <h1>Backlog</h1>
        <p>Prioritize work across all boards.</p>
      </div>
      {loading && <div className="backlog-empty">Loading backlog...</div>}
      {error && <div className="backlog-error">{error}</div>}
      {!loading && !error && grouped.length === 0 && (
        <div className="backlog-empty">No tasks in backlog.</div>
      )}
      {!loading &&
        grouped.map(([boardName, boardTasks]) => (
          <section key={boardName} className="backlog-board-group">
            <h2>{boardName}</h2>
            <div className="backlog-table-wrap">
              <table className="backlog-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Due date</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {boardTasks.map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{t.listTitle}</td>
                      <td>{t.priority}</td>
                      <td>{t.assigneeName || 'Unassigned'}</td>
                      <td>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        <Link to={`/boards/${t.boardId}`}>View board</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
    </div>
  );
};
