import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@aipt/utils';
import type { Todo } from '../route';

// GET /api/todos/[id] - Get a single todo
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const todos: Todo[] = (await storage.getItem('todos')) || [];
    const todo = todos.find((t) => t.id === params.id);

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ data: todo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 });
  }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const todos: Todo[] = (await storage.getItem('todos')) || [];
    const index = todos.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const updatedTodo: Todo = {
      ...todos[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updatedTodo;
    await storage.setItem('todos', todos);

    return NextResponse.json({ data: updatedTodo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const todos: Todo[] = (await storage.getItem('todos')) || [];
    const filteredTodos = todos.filter((t) => t.id !== params.id);

    if (filteredTodos.length === todos.length) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await storage.setItem('todos', filteredTodos);

    return NextResponse.json({ data: { id: params.id } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
