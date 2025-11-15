import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@aipt/utils';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /api/todos - Get all todos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const completed = searchParams.get('completed');

    const todos: Todo[] = (await storage.getItem('todos')) || [];

    let filteredTodos = todos;

    // Filter by completed status if provided
    if (completed !== null) {
      const isCompleted = completed === 'true';
      filteredTodos = todos.filter((todo) => todo.completed === isCompleted);
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTodos = filteredTodos.slice(start, end);

    return NextResponse.json({
      data: paginatedTodos,
      pagination: {
        page,
        limit,
        total: filteredTodos.length,
        totalPages: Math.ceil(filteredTodos.length / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const todos: Todo[] = (await storage.getItem('todos')) || [];

    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    todos.push(newTodo);
    await storage.setItem('todos', todos);

    return NextResponse.json({ data: newTodo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
