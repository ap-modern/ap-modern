'use client';

import { useState } from 'react';
import {
  useGetTodos,
  useCreateTodo,
  updateTodo,
  deleteTodo,
  type GetTodosQueryParams,
  type CreateTodoDTO,
  type UpdateTodoDTO,
  type UpdateTodoPathParams,
  type DeleteTodoPathParams,
} from '../lib/apis';
import type { Todo } from '../lib/apis/types';

export default function TodoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<boolean | undefined>(undefined);

  // Build query params for filtering
  const queryParams: GetTodosQueryParams = {
    page: 1,
    limit: 10,
    ...(filterCompleted !== undefined && { completed: filterCompleted }),
  };

  // Fetch todos using generated hook
  const { data, isLoading, error, refetch: refetchTodos } = useGetTodos(queryParams);

  // Create todo mutation using generated hook
  const createMutation = useCreateTodo({
    onSuccess: () => {
      setTitle('');
      setDescription('');
      void refetchTodos();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const todoData: CreateTodoDTO = {
      title: title.trim(),
      ...(description.trim() && { description: description.trim() }),
    };
    createMutation.mutate(todoData);
  };

  const handleToggle = (todo: Todo) => {
    const pathParams: UpdateTodoPathParams = { id: todo.id };
    const updateData: UpdateTodoDTO = { completed: !todo.completed };
    updateTodo(pathParams, updateData)
      .then(() => {
        void refetchTodos();
      })
      .catch((error) => {
        console.error('Failed to update todo:', error.message);
      });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      const pathParams: DeleteTodoPathParams = { id };
      deleteTodo(pathParams)
        .then(() => {
          void refetchTodos();
        })
        .catch((error) => {
          console.error('Failed to delete todo:', error.message);
        });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Todo List Demo</h1>
      <p>This page demonstrates the auto-generated API client usage.</p>
      <p>
        <strong>Note:</strong> Run <code>pnpm gen:fetch</code> to generate API client code from
        Swagger.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo title"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }}
          />
        </div>
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Add Todo'}
        </button>
      </form>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={filterCompleted === true}
            onChange={(e) => setFilterCompleted(e.target.checked ? true : undefined)}
          />{' '}
          Show completed only
        </label>
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="checkbox"
            checked={filterCompleted === false}
            onChange={(e) => setFilterCompleted(e.target.checked ? false : undefined)}
          />{' '}
          Show active only
        </label>
        <button
          type="button"
          onClick={() => setFilterCompleted(undefined)}
          style={{ marginLeft: '1rem' }}
        >
          Show all
        </button>
      </div>

      {isLoading && <p>Loading todos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      {data?.data && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.data.map((todo: Todo) => (
            <li
              key={todo.id}
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  {todo.title}
                </strong>
                {todo.description && (
                  <p style={{ margin: '0.5rem 0 0 1.5rem', color: '#666' }}>{todo.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(todo.id)}
                style={{ marginLeft: '1rem', color: 'red' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {data?.data?.pagination && (
        <div style={{ marginTop: '1rem', color: '#666' }}>
          Page {data.data.pagination.page} of {data.data.pagination.totalPages} (
          {data.data.pagination.total} total)
        </div>
      )}
    </div>
  );
}
