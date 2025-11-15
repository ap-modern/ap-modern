/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Type } from 'class-transformer';

export class Todo {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  completed: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

export class Pagination {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsNumber()
  @IsOptional()
  totalPages?: number;
}
