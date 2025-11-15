import {
  buildApiUrl,
  serializeQueryParams,
  calculatePagination,
  formatErrorMessage,
  httpStatus,
  ApiError,
} from '../../src/request/api-utils';
describe('API Utils', () => {
  describe('buildApiUrl', () => {
    it('should return URL without params', () => {
      expect(buildApiUrl('/api/users')).toBe('/api/users');
    });
    it('should append query params', () => {
      const url = buildApiUrl('/api/users', { page: 1, limit: 10 });
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });
    it('should handle array params', () => {
      const url = buildApiUrl('/api/users', { ids: [1, 2, 3] });
      expect(url).toContain('ids=1');
      expect(url).toContain('ids=2');
      expect(url).toContain('ids=3');
    });
    it('should handle Date params', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const url = buildApiUrl('/api/users', { date });
      expect(url).toContain(date.toISOString());
    });
    it('should handle object params', () => {
      const url = buildApiUrl('/api/users', { filter: { name: 'test' } });
      expect(url).toContain(encodeURIComponent(JSON.stringify({ name: 'test' })));
    });
    it('should skip undefined and null values', () => {
      const url = buildApiUrl('/api/users', {
        page: 1,
        limit: undefined,
        filter: null,
      });
      expect(url).toContain('page=1');
      expect(url).not.toContain('limit');
      expect(url).not.toContain('filter');
    });
  });
  describe('serializeQueryParams', () => {
    it('should serialize simple params', () => {
      const result = serializeQueryParams({ page: 1, limit: 10 });
      expect(result).toContain('page=1');
      expect(result).toContain('limit=10');
    });
    it('should handle arrays', () => {
      const result = serializeQueryParams({ ids: [1, 2, 3] });
      expect(result).toContain('ids=1');
      expect(result).toContain('ids=2');
      expect(result).toContain('ids=3');
    });
    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const result = serializeQueryParams({ date });
      expect(result).toContain(date.toISOString());
    });
    it('should skip undefined and null', () => {
      const result = serializeQueryParams({
        page: 1,
        limit: undefined,
        filter: null,
      });
      expect(result).toContain('page=1');
      expect(result).not.toContain('limit');
      expect(result).not.toContain('filter');
    });
  });
  describe('calculatePagination', () => {
    it('should calculate pagination correctly', () => {
      const result = calculatePagination(2, 10, 25);
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
    it('should handle first page', () => {
      const result = calculatePagination(1, 10, 25);
      expect(result.hasPrev).toBe(false);
      expect(result.hasNext).toBe(true);
    });
    it('should handle last page', () => {
      const result = calculatePagination(3, 10, 25);
      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(false);
    });
    it('should handle single page', () => {
      const result = calculatePagination(1, 10, 5);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });
  });
  describe('formatErrorMessage', () => {
    it('should format ApiError', () => {
      const error = new ApiError('Test error', 400);
      expect(formatErrorMessage(error)).toBe('Test error');
    });
    it('should format Error', () => {
      const error = new Error('Test error');
      expect(formatErrorMessage(error)).toBe('Test error');
    });
    it('should format string', () => {
      expect(formatErrorMessage('Test error')).toBe('Test error');
    });
    it('should handle unknown error', () => {
      expect(formatErrorMessage({})).toBe('An unexpected error occurred');
    });
  });
  describe('httpStatus', () => {
    it('should identify success codes', () => {
      expect(httpStatus.isSuccess(200)).toBe(true);
      expect(httpStatus.isSuccess(201)).toBe(true);
      expect(httpStatus.isSuccess(299)).toBe(true);
      expect(httpStatus.isSuccess(199)).toBe(false);
      expect(httpStatus.isSuccess(300)).toBe(false);
    });
    it('should identify client errors', () => {
      expect(httpStatus.isClientError(400)).toBe(true);
      expect(httpStatus.isClientError(404)).toBe(true);
      expect(httpStatus.isClientError(499)).toBe(true);
      expect(httpStatus.isClientError(399)).toBe(false);
      expect(httpStatus.isClientError(500)).toBe(false);
    });
    it('should identify server errors', () => {
      expect(httpStatus.isServerError(500)).toBe(true);
      expect(httpStatus.isServerError(503)).toBe(true);
      expect(httpStatus.isServerError(599)).toBe(true);
      expect(httpStatus.isServerError(499)).toBe(false);
      expect(httpStatus.isServerError(600)).toBe(false);
    });
    it('should identify unauthorized', () => {
      expect(httpStatus.isUnauthorized(401)).toBe(true);
      expect(httpStatus.isUnauthorized(403)).toBe(false);
    });
    it('should identify forbidden', () => {
      expect(httpStatus.isForbidden(403)).toBe(true);
      expect(httpStatus.isForbidden(401)).toBe(false);
    });
    it('should identify not found', () => {
      expect(httpStatus.isNotFound(404)).toBe(true);
      expect(httpStatus.isNotFound(400)).toBe(false);
    });
  });
  describe('ApiError', () => {
    it('should create error with message', () => {
      const error = new ApiError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ApiError');
    });
    it('should create error with status', () => {
      const error = new ApiError('Test error', 404);
      expect(error.status).toBe(404);
    });
    it('should create error with code', () => {
      const error = new ApiError('Test error', 400, 'INVALID_REQUEST');
      expect(error.code).toBe('INVALID_REQUEST');
    });
    it('should create error with data', () => {
      const errorData = { field: 'email', reason: 'invalid' };
      const error = new ApiError('Test error', 400, undefined, errorData);
      expect(error.data).toEqual(errorData);
    });
  });
});
//# sourceMappingURL=api-utils.test.js.map
