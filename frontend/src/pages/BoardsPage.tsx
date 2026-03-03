import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { BoardModal } from '../components/boards/BoardModal';
import '../styles/boards.css';
import { useSearch } from '../context/SearchContext';

type Board = {
  id: number;
  name: string;
  createdAt: string;
};

export const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [open, setOpen] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);
  const { query } = useSearch();

  useEffect(() => {
    apiClient.get('/boards').then((res) => {
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
      setBoards(normalized);
    });
  }, []);

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="boards-page">
      <div className="boards-header">
        <h1>Boards</h1>
        <div className="boards-header-right">
          <button className="btn-primary" onClick={() => setOpen(true)}>
            + Create board
          </button>
        </div>
      </div>
      <div className="board-grid">
        {filteredBoards.map((b) => (
          <div key={b.id} className="board-card">
            <div className="board-card-header">
              <Link to={`/boards/${b.id}`} className="board-card-title">
                {b.name}
              </Link>
              <button
                className="board-card-menu-btn"
                type="button"
                onClick={() => setMenuId((prev) => (prev === b.id ? null : b.id))}
              >
                ⋯
              </button>
              {menuId === b.id && (
                <div className="board-card-menu">
                  <button
                    type="button"
                    onClick={async () => {
                      const name = window.prompt('New board name', b.name);
                      if (!name) return;
                      const res = await apiClient.patch(`/boards/${b.id}`, {
                        name
                      });
                      setBoards((prev) =>
                        prev.map((bd) => (bd.id === b.id ? res.data.board : bd))
                      );
                      setMenuId(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Archive this board?')) return;
                      await apiClient.delete(`/boards/${b.id}`);
                      setBoards((prev) => prev.filter((bd) => bd.id !== b.id));
                      setMenuId(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="board-card-footer">
              <span className="board-card-updated">
                Created {new Date(b.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {filteredBoards.length === 0 && (
          <div className="boards-empty">
            No boards yet. Create a workspace, then create your first board.
          </div>
        )}
      </div>
      {open && (
        <BoardModal
          onClose={() => setOpen(false)}
          onCreated={(board) => setBoards((prev) => [board, ...prev])}
        />
      )}
    </div>
  );
};
