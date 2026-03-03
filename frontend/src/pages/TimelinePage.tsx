import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import '../styles/timeline.css';

type TimelineItem = {
  id: number;
  title: string;
  boardId: number;
  boardName: string;
  assigneeName: string | null;
  dueDate: string;
  priority: string;
};

export const TimelinePage: React.FC = () => {
  const [items, setItems] = useState<TimelineItem[]>([]);
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
        const list: TimelineItem[] = [];
        for (const d of details) {
          const board = d.data?.board;
          const cards = Array.isArray(d.data?.cards) ? d.data.cards : [];
          cards.forEach((c: any) => {
            if (!c.due_date) return;
            list.push({
              id: c.id,
              title: c.title,
              boardId: board.id,
              boardName: board.name,
              assigneeName: c.assignee_name || null,
              dueDate: c.due_date,
              priority: c.priority || 'MEDIUM'
            });
          });
        }
        list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setItems(list);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load timeline');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    items.forEach((item) => {
      const key = new Date(item.dueDate).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="timeline-page">
      <div className="timeline-head">
        <h1>Timeline</h1>
        <p>Track upcoming deadlines across your boards.</p>
      </div>
      {loading && <div className="timeline-empty">Loading timeline...</div>}
      {error && <div className="timeline-error">{error}</div>}
      {!loading && !error && groupedByDate.length === 0 && (
        <div className="timeline-empty">No tasks with due dates yet.</div>
      )}
      {!loading &&
        groupedByDate.map(([dateKey, entries]) => (
          <section key={dateKey} className="timeline-group">
            <h2>{new Date(dateKey).toLocaleDateString()}</h2>
            <div className="timeline-list">
              {entries.map((item) => (
                <article key={item.id} className="timeline-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.boardName} · {item.assigneeName || 'Unassigned'}
                    </p>
                  </div>
                  <div className="timeline-right">
                    <span className="timeline-priority">{item.priority}</span>
                    <Link to={`/boards/${item.boardId}`}>Open</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
};
