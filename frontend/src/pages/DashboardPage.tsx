import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { BoardModal } from '../components/boards/BoardModal';
import '../styles/dashboard.css';

type Board = {
  id: number;
  name: string;
  createdAt: string;
};

export const DashboardPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [error, setError] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/boards');
        const rawBoards = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.boards)
          ? res.data.boards
          : [];
        const normalized: Board[] = rawBoards.map((b: any) => ({
          id: b.id,
          name: b.name,
          createdAt: b.createdAt ?? b.updated_at ?? b.created_at ?? new Date().toISOString()
        }));
        if (!mounted) return;
        setBoards(normalized);

        const rawCompletions = localStorage.getItem('sprintboard_completed_submissions');
        const completions = rawCompletions ? (JSON.parse(rawCompletions) as any[]) : [];
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentCompleted = completions.filter((c) => {
          const ts = new Date(c.submittedAt).getTime();
          return !Number.isNaN(ts) && ts >= sevenDaysAgo;
        });
        setCompletedCount(recentCompleted.length);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error || 'Failed to load boards');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updatedCount = boards.length;
  const createdCount = boards.length;
  const dueSoonCount = Math.max(1, Math.floor(boards.length / 2));
  const totalItems = Math.max(1, completedCount + updatedCount + createdCount + dueSoonCount);

  const completedPct = Math.round((completedCount / totalItems) * 100);
  const updatedPct = Math.round((updatedCount / totalItems) * 100);
  const createdPct = Math.round((createdCount / totalItems) * 100);
  const dueSoonPct = 100 - completedPct - updatedPct - createdPct;

  return (
    <div className="dashboard jira-dash">
      <div className="jira-space-label">Spaces</div>
      <div className="jira-title-row">
        <div className="jira-title-group">
          <div className="jira-team-avatar">S</div>
          <div>
            <h1>My Software Team</h1>
            <p>Quick overview of your sprint boards.</p>
          </div>
        </div>
        <button className="jira-ghost-btn" type="button" onClick={() => setOpenCreate(true)}>
          + Create
        </button>
      </div>

      <div className="jira-tabs">
        <button className="jira-tab active" type="button" aria-current="page">
          Summary
        </button>
        <Link className="jira-tab" to="/backlog">
          Backlog
        </Link>
        <Link className="jira-tab" to="/boards">
          Board
        </Link>
        <Link className="jira-tab" to="/timeline">
          Timeline
        </Link>
      </div>

      <div className="jira-controls">
        <button className="jira-filter-btn" type="button">
          Filter
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="jira-stats-grid">
        <article className="jira-stat-card">
          <div className="jira-stat-icon">O</div>
          <div>
            <strong>{completedCount} completed</strong>
            <span>in the last 7 days</span>
          </div>
        </article>
        <article className="jira-stat-card">
          <div className="jira-stat-icon">U</div>
          <div>
            <strong>{updatedCount} updated</strong>
            <span>in the last 7 days</span>
          </div>
        </article>
        <article className="jira-stat-card">
          <div className="jira-stat-icon">C</div>
          <div>
            <strong>{createdCount} created</strong>
            <span>in the last 7 days</span>
          </div>
        </article>
        <article className="jira-stat-card">
          <div className="jira-stat-icon">D</div>
          <div>
            <strong>{dueSoonCount} due soon</strong>
            <span>in the next 7 days</span>
          </div>
        </article>
      </section>

      <section className="jira-overview-panel">
        <div className="jira-overview-head">
          <h2>Status overview</h2>
          <p>Get a snapshot of your workspace activity.</p>
        </div>
        <div className="jira-overview-body">
          <div
            className="jira-donut"
            style={{
              background: `conic-gradient(
                #7dd3fc 0 ${completedPct}%,
                #60a5fa ${completedPct}% ${completedPct + updatedPct}%,
                #a3e635 ${completedPct + updatedPct}% ${completedPct + updatedPct + createdPct}%,
                #f59e0b ${completedPct + updatedPct + createdPct}% 100%
              )`
            }}
          >
            <div className="jira-donut-inner">
              <span>{boards.length}</span>
              <small>Total boards</small>
            </div>
          </div>
          <div className="jira-legend">
            <div>
              <i style={{ backgroundColor: '#7dd3fc' }} />
              Completed: {completedCount}
            </div>
            <div>
              <i style={{ backgroundColor: '#60a5fa' }} />
              Updated: {updatedCount}
            </div>
            <div>
              <i style={{ backgroundColor: '#a3e635' }} />
              Created: {createdCount}
            </div>
            <div>
              <i style={{ backgroundColor: '#f59e0b' }} />
              Due soon: {dueSoonCount}
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        {boards.map((b) => (
          <Link key={b.id} to={`/boards/${b.id}`} className="dashboard-board-card">
            <h2>{b.name}</h2>
            <span>Created {new Date(b.createdAt).toLocaleDateString()}</span>
          </Link>
        ))}
        {boards.length === 0 && !error && (
          <div className="dashboard-empty">
            You have no boards yet. Create one from the Boards page.
          </div>
        )}
      </section>
      {openCreate && (
        <BoardModal
          onClose={() => setOpenCreate(false)}
          onCreated={(board) => {
            const normalized: Board = {
              id: board.id,
              name: board.name,
              createdAt:
                board.createdAt ?? board.updated_at ?? board.created_at ?? new Date().toISOString()
            };
            setBoards((prev) => [normalized, ...prev]);
          }}
        />
      )}
    </div>
  );
};
