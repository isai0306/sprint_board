import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from '@hello-pangea/dnd';
import { apiClient } from '../lib/apiClient';
import { KanbanBoard, KanbanCard } from '../components/kanban/KanbanBoard';
import { TaskModal, TaskFormValues } from '../components/kanban/TaskModal';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../hooks/useAuth';
import '../styles/board.css';

type Board = { id: number; name: string; description?: string | null };
type Column = { id: number; title: string; position: number };

type Task = {
  id: number;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  columnId: number | null;
  assigneeId: number | null;
  assigneeName: string | null;
  dueDate: string | null;
  position: number;
};

type WorkspaceMember = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
};

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = boardId ? Number(boardId) : undefined;
  const { query } = useSearch();
  const { user } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [markedDoneCardIds, setMarkedDoneCardIds] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!numericBoardId) return;
    apiClient
      .get(`/boards/${numericBoardId}`)
      .then((res) => {
        const boardData = res.data?.board ?? null;
        const lists = Array.isArray(res.data?.lists) ? res.data.lists : [];
        const cards = Array.isArray(res.data?.cards) ? res.data.cards : [];

        setBoard(boardData);
        setColumns(
          lists
            .map((l: any) => ({
              id: l.id,
              title: l.title,
              position: Number(l.position) || 0
            }))
            .sort((a: Column, b: Column) => a.position - b.position)
        );

        setTasks(
          cards.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description ?? null,
            priority: c.priority ?? 'MEDIUM',
            columnId: c.list_id ?? null,
            assigneeId: c.assigned_to ?? null,
            assigneeName: c.assignee_name ?? null,
            dueDate: c.due_date ?? null,
            position: Number(c.position) || 0
          }))
        );

        if (boardData?.workspace_id) {
          apiClient
            .get(`/workspaces/${boardData.workspace_id}/members`)
            .then((membersRes) =>
              setMembers(
                Array.isArray(membersRes.data?.members) ? membersRes.data.members : []
              )
            )
            .catch(() => setMembers([]));
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'Failed to load board');
      });
  }, [numericBoardId]);

  useEffect(() => {
    if (!selectedTask) return;
    const latest = tasks.find((t) => t.id === selectedTask.id);
    if (!latest) return;
    if (latest !== selectedTask) {
      setSelectedTask(latest);
    }
  }, [tasks, selectedTask]);

  const cardsByList = useMemo(() => {
    const visibleTasks = tasks.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    const map: Record<number, KanbanCard[]> = {};
    for (const t of visibleTasks) {
      if (!t.columnId) continue;
      if (!map[t.columnId]) map[t.columnId] = [];
      map[t.columnId].push({
        id: t.id,
        title: t.title,
        priority: t.priority,
        columnId: t.columnId,
        assigneeName:
          t.assigneeName ||
          members.find((m) => m.id === t.assigneeId)?.name ||
          null,
        dueDate: t.dueDate
      });
    }
    return map;
  }, [tasks, query, members]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !numericBoardId) return;
    const cardId = Number(result.draggableId);
    const toListId = Number(result.destination.droppableId);
    const position = result.destination.index;

    const prev = tasks;
    setTasks((curr) =>
      curr.map((t) =>
        t.id === cardId ? { ...t, columnId: toListId, position } : t
      )
    );

    try {
      await apiClient.post('/boards/cards/move', {
        boardId: numericBoardId,
        cardId,
        toListId,
        position
      });
    } catch (err: any) {
      setTasks(prev);
      setError(err?.response?.data?.error || 'Failed to move task');
    }
  };

  const handleAddCard = (listId?: number) => {
    const targetListId = listId ?? columns[0]?.id;
    if (!targetListId) return;
    setSelectedTask({
      id: 0,
      title: '',
      description: '',
      priority: 'MEDIUM',
      columnId: targetListId,
      assigneeId: null,
      assigneeName: null,
      dueDate: null,
      position: 0
    });
    setShowTaskModal(true);
  };

  const handleSelectCard = (card: KanbanCard) => {
    const task = tasks.find((t) => t.id === card.id);
    if (!task) return;
    setSelectedTask(task);
  };

  const handleCompleteCard = async (taskId: number) => {
    setMarkedDoneCardIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmitCompletion = () => {
    if (!numericBoardId || markedDoneCardIds.length === 0) return;
    const records = markedDoneCardIds
      .map((id) => tasks.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => ({
        taskId: t!.id,
        boardId: numericBoardId,
        title: t!.title,
        assigneeName:
          t!.assigneeName ||
          members.find((m) => m.id === t!.assigneeId)?.name ||
          'Unassigned',
        submittedAt: new Date().toISOString()
      }));

    let existing: any[] = [];
    try {
      const raw = localStorage.getItem('sprintboard_completed_submissions');
      existing = raw ? (JSON.parse(raw) as any[]) : [];
    } catch {
      existing = [];
    }

    const merged = [...existing];
    for (const r of records) {
      const already = merged.some((e) => e.taskId === r.taskId);
      if (!already) merged.push(r);
    }

    localStorage.setItem('sprintboard_completed_submissions', JSON.stringify(merged));
    setMarkedDoneCardIds([]);
  };

  const handleSaveTask = async (values: TaskFormValues) => {
    if (!numericBoardId) return;
    if (values.id && values.id !== 0) {
      throw new Error('Editing existing tasks is not supported in this API yet');
    }

    const position = tasks.filter((t) => t.columnId === values.columnId).length;
    const res = await apiClient.post('/boards/cards', {
      boardId: numericBoardId,
      listId: values.columnId,
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
      position
    });

    const card = res.data?.card;
    if (card) {
      setTasks((curr) => [
        ...curr,
        {
          id: card.id,
          title: card.title,
          description: card.description ?? null,
          priority: card.priority ?? 'MEDIUM',
          columnId: card.list_id ?? values.columnId,
          assigneeId: card.assigned_to ?? null,
          assigneeName:
            card.assignee_name ||
            members.find((m) => m.id === (card.assigned_to ?? null))?.name ||
            null,
          dueDate: card.due_date ?? null,
          position: Number(card.position) || position
        }
      ]);
    }
  };

  const initialFormValues: TaskFormValues =
    selectedTask && columns.length
      ? {
          id: selectedTask.id || undefined,
          title: selectedTask.title,
          description: selectedTask.description || '',
          priority: selectedTask.priority,
          columnId: selectedTask.columnId || columns[0].id,
          assigneeId: selectedTask.assigneeId
            ? String(selectedTask.assigneeId)
            : null,
          dueDate: selectedTask.dueDate,
          workType: 'Task',
          status: columns.find((c) => c.id === (selectedTask.columnId || columns[0].id))?.title || 'To Do',
          labels: '',
          team: '',
          startDate: null,
          sprint: '',
          storyPoints: '',
          reporterName: user?.name || 'Current User',
          parent: '',
          linkType: 'blocks',
          linkTarget: '',
          restrictRoles: '',
          flagged: false,
          createAnother: false
        }
      : {
          title: '',
          description: '',
          priority: 'MEDIUM',
          columnId: columns[0]?.id ?? 0,
          assigneeId: null,
          dueDate: null,
          workType: 'Task',
          status: 'To Do',
          labels: '',
          team: '',
          startDate: null,
          sprint: '',
          storyPoints: '',
          reporterName: user?.name || 'Current User',
          parent: '',
          linkType: 'blocks',
          linkTarget: '',
          restrictRoles: '',
          flagged: false,
          createAnother: false
        };

  return (
    <div className="board-page">
      <div className="board-header">
        <div>
          <h1>{board?.name || 'Board'}</h1>
        </div>
        <div className="board-header-actions">
          <button
            className="btn-ghost"
            type="button"
            onClick={handleSubmitCompletion}
            disabled={markedDoneCardIds.length === 0}
          >
            Submit completion ({markedDoneCardIds.length})
          </button>
          <button className="btn-primary" type="button" onClick={() => handleAddCard()}>
            + New task
          </button>
        </div>
      </div>
      {error && <div className="board-error">{error}</div>}
      <div className="board-main">
        <div className="board-kanban">
          <KanbanBoard
            lists={columns.map((c) => ({ id: c.id, title: c.title }))}
            cardsByList={cardsByList}
            onDragEnd={handleDragEnd}
            onAddCard={handleAddCard}
            onSelectCard={handleSelectCard}
            onToggleDoneMark={handleCompleteCard}
            markedDoneCardIds={markedDoneCardIds}
          />
        </div>
        <aside className="board-detail">
          {selectedTask ? (
            <>
              <h2>{selectedTask.title}</h2>
              {selectedTask.description && (
                <p className="board-subtitle">{selectedTask.description}</p>
              )}
              <div className="board-detail-meta">
                <span
                  className={`badge-priority badge-priority-${selectedTask.priority.toLowerCase()}`}
                >
                  {selectedTask.priority}
                </span>
                <span className="board-detail-assignee">
                  Assigned to{' '}
                  {selectedTask.assigneeName ||
                    members.find((m) => m.id === selectedTask.assigneeId)?.name ||
                    'Unassigned'}
                </span>
                <span className="board-detail-due">
                  Due{' '}
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : 'Not set'}
                </span>
                <span className="board-detail-status">
                  Status{' '}
                  {columns.find((c) => c.id === selectedTask.columnId)?.title || 'Unknown'}
                </span>
              </div>
              <div className="board-detail-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowTaskModal(true)}
                >
                  Edit task
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Task details</h2>
              <p>Select a card to see more details here.</p>
            </>
          )}
        </aside>
      </div>
      {columns.length > 0 && (
        <TaskModal
          isOpen={showTaskModal}
          columns={columns.map((c) => ({ id: c.id, title: c.title }))}
          assignees={members.map((m) => ({ id: m.id, name: m.name, email: m.email }))}
          workspaceName={board?.name ? 'My Software Team (SCRUM)' : 'Workspace'}
          reporterName={user?.name || 'Current User'}
          initial={initialFormValues}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleSaveTask}
        />
      )}
    </div>
  );
};
