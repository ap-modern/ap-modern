import 'reflect-metadata';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  isBoolean,
  isNumber,
  isString,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

interface NumberOptions {
  allowInfinity?: boolean;
  allowNan?: boolean;
  maxDecimalPlaces?: number;
}

function isOptional(value: unknown) {
  return value === undefined || value === null;
}

export function jsonToFormData(json: Record<string, unknown>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(json)) {
    formData.append(key, value as string | Blob);
  }
  return formData;
}

export function IsOptionalString(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isOptionalString',
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          const { object, property } = args;
          return isOptional((object as Record<string, unknown>)[property]) || isString(value);
        },
      },
    },
    validationOptions ?? {
      message: (args: ValidationArguments) => `${args.property} should be a string`,
    }
  );
}

export function IsOptionalNumber(
  validationOptions?: ValidationOptions,
  option: NumberOptions = {}
) {
  return ValidateBy(
    {
      name: 'isOptionalNumber',
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          const { object, property } = args;
          return (
            isOptional((object as Record<string, unknown>)[property]) || isNumber(value, option)
          );
        },
      },
    },
    validationOptions ?? {
      message: (args: ValidationArguments) => `${args.property} should be a number`,
    }
  );
}

export function IsOptionalBoolean(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isOptionalBoolean',
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          const { object, property } = args;
          return isOptional((object as Record<string, unknown>)[property]) || isBoolean(value);
        },
      },
    },
    validationOptions ?? {
      message: (args: ValidationArguments) => `${args.property} should be a boolean`,
    }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class HTTPResponse<T = any> {
  @IsString()
  @IsOptional()
  error?: string;

  @IsOptional()
  data?: T;

  @IsBoolean()
  @IsOptional()
  success?: boolean;

  @IsNumber()
  @IsOptional()
  code?: number;
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response validation utility
export function validateApiResponse<T>(response: HTTPResponse<T>): T {
  if (!response.success && response.success !== undefined) {
    throw new ApiError(
      response.error || 'API request failed',
      response.code,
      undefined,
      response.data
    );
  }

  if (response.data === undefined) {
    throw new ApiError('No data received from API');
  }

  return response.data;
}

// URL building utilities
export function buildApiUrl(url: string, params?: Record<string, unknown>): string {
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
    } else if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

// Request retry utility
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Don't retry on authentication errors
      if (error instanceof ApiError && error.status === 401) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError ?? new Error('Retry failed');
}

// Pagination utilities
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function calculatePagination(page: number, limit: number, total: number): PaginationInfo {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Data transformation utilities
export function transformDates<T extends Record<string, unknown>>(obj: T): T {
  const transformed = { ...obj } as Record<string, unknown>;

  for (const key of Object.keys(transformed)) {
    const value = transformed[key];

    // Transform ISO date strings to Date objects
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      transformed[key] = new Date(value);
    }

    // Recursively transform nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      transformed[key] = transformDates(value as Record<string, unknown>);
    }

    // Transform arrays
    if (Array.isArray(value)) {
      transformed[key] = value.map((item) =>
        item && typeof item === 'object' ? transformDates(item as Record<string, unknown>) : item
      );
    }
  }

  return transformed as T;
}

// Query parameter serialization
export function serializeQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

// Loading state management
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export function createLoadingState(): LoadingState {
  return {
    isLoading: false,
    error: null,
  };
}

// Debounce utility for search queries
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format error messages for display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

// HTTP status code utilities
export const httpStatus = {
  isSuccess: (code: number): boolean => code >= 200 && code < 300,
  isClientError: (code: number): boolean => code >= 400 && code < 500,
  isServerError: (code: number): boolean => code >= 500 && code < 600,
  isUnauthorized: (code: number): boolean => code === 401,
  isForbidden: (code: number): boolean => code === 403,
  isNotFound: (code: number): boolean => code === 404,
} as const;
