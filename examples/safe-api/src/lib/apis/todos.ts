/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@aipt/utils';
import * as Types from './types';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';

export class GetTodosQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export type GetTodosResponse = any;

export class CreateTodoDTO {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
export type CreateTodoResponse = any;

export class GetTodoPathParams {
  @IsString()
  id: string;
}

export type GetTodoResponse = any;

export class UpdateTodoPathParams {
  @IsString()
  id: string;
}

export class UpdateTodoDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
export type UpdateTodoResponse = any;

export class DeleteTodoPathParams {
  @IsString()
  id: string;
}

export class DeleteTodoResponse {
  @IsString()
  @IsOptional()
  id?: string;
}
/**
 * Get all todos
 */
export async function getTodos(
  queryParams?: GetTodosQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.Todo[]>> {
  return await apiRequest<Types.Todo[]>('/api/todos', {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * Create a new todo
 */
export async function createTodo(
  data: CreateTodoDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.Todo>> {
  return await apiRequest<Types.Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * Get a todo by ID
 */
export async function getTodo(
  pathParams: GetTodoPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.Todo>> {
  return await apiRequest<Types.Todo>(`/api/todos/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * Update a todo
 */
export async function updateTodo(
  pathParams: UpdateTodoPathParams,
  data: UpdateTodoDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.Todo>> {
  return await apiRequest<Types.Todo>(`/api/todos/${pathParams.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * Delete a todo
 */
export async function deleteTodo(
  pathParams: DeleteTodoPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<DeleteTodoResponse>> {
  return await apiRequest<DeleteTodoResponse>(`/api/todos/${pathParams.id}`, {
    method: 'DELETE',
    noAuthorize: noAuthorize,
  });
}

/**
 * Get all todos Hook
 */
export function useGetTodos(
  queryParams?: GetTodosQueryParams,
  options?: UseQueryOptions<HTTPResponse<GetTodosResponse>, Error>
) {
  return useQuery({
    queryKey: [
      'todos',
      'get_all_todos',
      queryParams?.page,
      queryParams?.limit,
      queryParams?.completed,
    ],
    queryFn: () => getTodos(queryParams),
    ...options,
  });
}

/**
 * Create a new todo Hook
 */
export function useCreateTodo(
  options?: UseMutationOptions<HTTPResponse<CreateTodoResponse>, Error, CreateTodoDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createTodo(data),
    onSuccess: () => {
      // Invalidate related cache
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * Get a todo by ID Hook
 */
export function useGetTodo(
  pathParams: GetTodoPathParams,
  options?: UseQueryOptions<HTTPResponse<GetTodoResponse>, Error>
) {
  return useQuery({
    queryKey: ['todos', 'get_a_todo_by_id', pathParams.id],
    queryFn: () => getTodo(pathParams),
    ...options,
  });
}

/**
 * Update a todo Hook
 */
export function useUpdateTodo(
  pathParams: UpdateTodoPathParams,
  options?: UseMutationOptions<HTTPResponse<UpdateTodoResponse>, Error, UpdateTodoDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateTodo(pathParams, data),
    onSuccess: () => {
      // Invalidate related cache
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * Delete a todo Hook
 */
export function useDeleteTodo(
  pathParams: DeleteTodoPathParams,
  options?: UseMutationOptions<HTTPResponse<DeleteTodoResponse>, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTodo(pathParams),
    onSuccess: () => {
      // Invalidate related cache
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}
