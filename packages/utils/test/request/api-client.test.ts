import { apiRequest, getCookie, redirectToLogin } from '../../src/request/api-client';
import { storage } from '../../src/storage';

// Mock fetch
global.fetch = jest.fn();

// Mock storage
jest.mock('../../src/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/test',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
    (storage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('getCookie', () => {
    beforeEach(() => {
      if (typeof document !== 'undefined') {
        Object.defineProperty(document, 'cookie', {
          value: '',
          writable: true,
          configurable: true,
        });
      }
    });

    it('should return cookie value', () => {
      if (typeof document !== 'undefined') {
        Object.defineProperty(document, 'cookie', {
          value: 'token=abc123; path=/',
          writable: true,
          configurable: true,
        });
        expect(getCookie('token')).toBe('abc123');
      }
    });

    it('should return null for non-existent cookie', () => {
      if (typeof document !== 'undefined') {
        Object.defineProperty(document, 'cookie', {
          value: 'other=value',
          writable: true,
          configurable: true,
        });
        expect(getCookie('token')).toBeNull();
      }
    });

    it('should return null in server environment', () => {
      expect(getCookie('token')).toBeNull();
    });
  });

  describe('redirectToLogin', () => {
    beforeEach(() => {
      mockLocation.href = '';
      mockLocation.pathname = '/test';
    });

    it('should redirect to login with callback URL', () => {
      if (typeof window !== 'undefined') {
        mockLocation.pathname = '/dashboard';
        redirectToLogin();
        expect(mockLocation.href).toBe('/login?callback_url=/dashboard');
      }
    });

    it('should redirect to login without callback for root path', () => {
      if (typeof window !== 'undefined') {
        mockLocation.pathname = '/';
        redirectToLogin();
        expect(mockLocation.href).toBe('/login');
      }
    });

    it('should not redirect twice', () => {
      if (typeof window !== 'undefined') {
        mockLocation.pathname = '/test';
        redirectToLogin();
        const firstHref = mockLocation.href;
        redirectToLogin();
        expect(mockLocation.href).toBe(firstHref);
      }
    });
  });

  describe('apiRequest', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1, name: 'Test' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest('/api/users/1');
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/1'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should include auth token in headers', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('test-token');
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: {} }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiRequest('/api/users');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle POST request with body', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const data = { name: 'Test' };
      await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('should handle query parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiRequest('/api/users', {
        params: { page: 1, limit: 10 },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });

    it('should handle 401 error and redirect to login', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiRequest('/api/users')).rejects.toThrow('Authentication required');
      expect(mockLocation.href).toBe('/login?callback_url=/test');
    });

    it('should handle 422 error', async () => {
      const mockResponse = {
        ok: false,
        status: 422,
        json: jest.fn().mockResolvedValue({ error: 'Validation error' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiRequest('/api/users')).rejects.toThrow('Authentication required');
    });

    it('should handle other HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Server error' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiRequest('/api/users')).rejects.toThrow('Server error');
    });

    it('should skip authorization when noAuthorize is true', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: {} }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiRequest('/api/public', { noAuthorize: true });
      expect(storage.getItem.bind(storage)).not.toHaveBeenCalled();
    });

    it('should handle response without data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ error: 'No data' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiRequest('/api/users')).rejects.toThrow('No data');
    });
  });
});
