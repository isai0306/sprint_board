import React, { useEffect, useState } from 'react';
import '../../styles/modal.css';
import '../../styles/task-create.css';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskFormValues = {
  id?: number;
  title: string;
  description: string;
  priority: TaskPriority;
  columnId: number;
  assigneeId: string | null;
  dueDate: string | null;
  workType: string;
  status: string;
  labels: string;
  team: string;
  startDate: string | null;
  sprint: string;
  storyPoints: string;
  reporterName: string;
  parent: string;
  linkType: string;
  linkTarget: string;
  restrictRoles: string;
  flagged: boolean;
  createAnother: boolean;
};

type ColumnOption = { id: number; title: string };
type AssigneeOption = { id: number; name: string; email: string };

type Props = {
  isOpen: boolean;
  columns: ColumnOption[];
  assignees: AssigneeOption[];
  workspaceName: string;
  reporterName: string;
  initial: TaskFormValues;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

export const TaskModal: React.FC<Props> = ({
  isOpen,
  columns,
  assignees,
  workspaceName,
  reporterName,
  initial,
  onClose,
  onSubmit
}) => {
  const [values, setValues] = useState<TaskFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setValues(initial);
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleChange = <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!values.title.trim()) {
      setError('Summary is required');
      return;
    }
    try {
      setSaving(true);
      await onSubmit(values);
      if (values.createAnother) {
        setValues({
          ...initial,
          title: '',
          description: '',
          labels: '',
          linkTarget: ''
        });
        setFiles([]);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel create-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-task-header">
          <h2>Create Task</h2>
          <button type="button" className="create-task-close" onClick={onClose}>
            X
          </button>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <form className="modal-form create-task-form" onSubmit={handleSubmit}>
          <div className="create-task-grid">
            <label>
              Space*
              <select value={workspaceName} disabled>
                <option>{workspaceName}</option>
              </select>
            </label>
            <label>
              Work type*
              <select value={values.workType} onChange={(e) => handleChange('workType', e.target.value)}>
                <option>Task</option>
                <option>Story</option>
                <option>Bug</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={values.columnId}
                onChange={(e) => handleChange('columnId', Number(e.target.value))}
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Summary*
              <input
                value={values.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Summary is required"
                required
              />
            </label>
            <label className="span-2">
              Description
              <textarea
                rows={5}
                value={values.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </label>
            <label>
              Assignee
              <select
                value={values.assigneeId ?? ''}
                onChange={(e) =>
                  handleChange('assigneeId', e.target.value === '' ? null : e.target.value)
                }
              >
                <option value="">Automatic</option>
                {assignees.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={values.priority}
                onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
            <label>
              Parent
              <input
                value={values.parent}
                onChange={(e) => handleChange('parent', e.target.value)}
                placeholder="Select parent"
              />
            </label>
            <label>
              Due date
              <input
                type="date"
                value={values.dueDate ? values.dueDate.substring(0, 10) : ''}
                onChange={(e) =>
                  handleChange('dueDate', e.target.value ? `${e.target.value}T00:00:00Z` : null)
                }
              />
            </label>
            <label>
              Labels
              <input
                value={values.labels}
                onChange={(e) => handleChange('labels', e.target.value)}
                placeholder="Select label"
              />
            </label>
            <label>
              Team
              <input
                value={values.team}
                onChange={(e) => handleChange('team', e.target.value)}
                placeholder="Choose a team"
              />
            </label>
            <label>
              Start date
              <input
                type="date"
                value={values.startDate ? values.startDate.substring(0, 10) : ''}
                onChange={(e) =>
                  handleChange('startDate', e.target.value ? `${e.target.value}T00:00:00Z` : null)
                }
              />
            </label>
            <label>
              Sprint
              <input
                value={values.sprint}
                onChange={(e) => handleChange('sprint', e.target.value)}
                placeholder="Select sprint"
              />
            </label>
            <label>
              Story point estimate
              <input
                value={values.storyPoints}
                onChange={(e) => handleChange('storyPoints', e.target.value)}
                placeholder="Estimate"
              />
            </label>
            <label>
              Reporter*
              <input value={values.reporterName || reporterName} readOnly />
            </label>
          </div>

          <div className="task-divider" />

          <label className="span-2">
            Attachment
            <div className="task-upload">
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFiles(Array.from(e.target.files || []))
                }
              />
              <span>
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : 'Drop files to attach or browse'}
              </span>
            </div>
          </label>

          <div className="create-task-grid">
            <label>
              Linked Work items
              <select
                value={values.linkType}
                onChange={(e) => handleChange('linkType', e.target.value)}
              >
                <option value="blocks">blocks</option>
                <option value="relates">relates to</option>
                <option value="duplicates">duplicates</option>
              </select>
            </label>
            <label>
              Type, search or paste URL
              <input
                value={values.linkTarget}
                onChange={(e) => handleChange('linkTarget', e.target.value)}
              />
            </label>
            <label>
              Restrict to
              <input
                value={values.restrictRoles}
                onChange={(e) => handleChange('restrictRoles', e.target.value)}
                placeholder="Select Roles"
              />
            </label>
            <div className="flagged-field">
              <span>Flagged</span>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={values.flagged}
                  onChange={(e) => handleChange('flagged', e.target.checked)}
                />
                <span>Impediment</span>
              </div>
              <small>Allows to flag issues with impediments.</small>
            </div>
          </div>

          <div className="modal-actions create-task-actions">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={values.createAnother}
                onChange={(e) => handleChange('createAnother', e.target.checked)}
              />
              <span>Create another</span>
            </label>
            <div className="right-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
