import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import '../../styles/kanban.css';

export type KanbanCard = {
  id: number;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  columnId: number;
  assigneeName?: string | null;
  dueDate?: string | null;
};

export type KanbanList = {
  id: number;
  title: string;
};

type Props = {
  lists: KanbanList[];
  cardsByList: Record<number, KanbanCard[]>;
  onDragEnd: (result: DropResult) => void;
  onAddCard: (listId: number) => void;
  onSelectCard: (card: KanbanCard) => void;
  onToggleDoneMark: (cardId: number) => void;
  markedDoneCardIds: number[];
};

export const KanbanBoard: React.FC<Props> = ({
  lists,
  cardsByList,
  onDragEnd,
  onAddCard,
  onSelectCard,
  onToggleDoneMark,
  markedDoneCardIds
}) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <div className="kanban-board">
      {lists.map((list) => (
        <Droppable droppableId={String(list.id)} key={list.id}>
          {(provided) => (
            <div
              className="kanban-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className="kanban-list-header">
                <span>{list.title}</span>
                <button
                  className="kanban-add-card"
                  type="button"
                  onClick={() => onAddCard(list.id)}
                >
                  +
                </button>
              </div>
              {(cardsByList[list.id] || []).map((card, index) => (
                <Draggable
                  key={card.id}
                  draggableId={String(card.id)}
                  index={index}
                >
                  {(drag) => (
                    <div
                      className="kanban-card"
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      {...drag.dragHandleProps}
                      onClick={() => onSelectCard(card)}
                    >
                      <div className="kanban-card-title">{card.title}</div>
                      <div className="kanban-card-meta">
                        <span
                          className={`badge-priority badge-priority-${card.priority.toLowerCase()}`}
                        >
                          {card.priority}
                        </span>
                        {card.assigneeName && (
                          <span className="kanban-card-assignee">
                            {card.assigneeName}
                          </span>
                        )}
                        {card.dueDate && (
                          <span className="kanban-card-due">
                            {new Date(card.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {list.title.toLowerCase() === 'done' && (
                        <button
                          type="button"
                          className={`kanban-complete-btn ${
                            markedDoneCardIds.includes(card.id)
                              ? 'kanban-complete-btn-marked'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleDoneMark(card.id);
                          }}
                        >
                          {markedDoneCardIds.includes(card.id)
                            ? 'Undo mark'
                            : 'Mark as done'}
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  </DragDropContext>
);
