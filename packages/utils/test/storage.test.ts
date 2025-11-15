import { storage, StorageManager } from '../src/storage';

describe('Storage', () => {
  beforeEach(async () => {
    await storage.clear();
  });

  describe('setItem and getItem', () => {
    it('should store and retrieve a string value', async () => {
      await storage.setItem('test-key', 'test-value');
      const value = await storage.getItem<string>('test-key');
      expect(value).toBe('test-value');
    });

    it('should store and retrieve a number value', async () => {
      await storage.setItem('count', 42);
      const value = await storage.getItem<number>('count');
      expect(value).toBe(42);
    });

    it('should store and retrieve an object', async () => {
      const obj = { id: 1, name: 'Test' };
      await storage.setItem('user', obj);
      const value = await storage.getItem<{ id: number; name: string }>('user');
      expect(value).toEqual(obj);
    });

    it('should return null for non-existent key', async () => {
      const value = await storage.getItem('non-existent');
      expect(value).toBeNull();
    });

    it('should overwrite existing value', async () => {
      await storage.setItem('key', 'value1');
      await storage.setItem('key', 'value2');
      const value = await storage.getItem<string>('key');
      expect(value).toBe('value2');
    });
  });

  describe('removeItem', () => {
    it('should remove an item', async () => {
      await storage.setItem('key', 'value');
      await storage.removeItem('key');
      const value = await storage.getItem('key');
      expect(value).toBeNull();
    });

    it('should not throw when removing non-existent key', async () => {
      await expect(storage.removeItem('non-existent')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      await storage.clear();
      expect(await storage.getItem('key1')).toBeNull();
      expect(await storage.getItem('key2')).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('should return true for existing key', async () => {
      await storage.setItem('key', 'value');
      expect(await storage.hasItem('key')).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      expect(await storage.hasItem('non-existent')).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return all keys', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      const keys = await storage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should return empty array when no items', async () => {
      const keys = await storage.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('length', () => {
    it('should return correct count', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      const length = await storage.length();
      expect(length).toBeGreaterThanOrEqual(2);
    });

    it('should return 0 when empty', async () => {
      await storage.clear();
      const length = await storage.length();
      expect(length).toBe(0);
    });
  });

  describe('setItems and getItems', () => {
    it('should set multiple items', async () => {
      await storage.setItems({
        key1: 'value1',
        key2: 'value2',
        key3: { id: 1 },
      });
      expect(await storage.getItem('key1')).toBe('value1');
      expect(await storage.getItem('key2')).toBe('value2');
      expect(await storage.getItem('key3')).toEqual({ id: 1 });
    });

    it('should get multiple items', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      const items = await storage.getItems<string>(['key1', 'key2']);
      expect(items).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should return null for non-existent keys in getItems', async () => {
      await storage.setItem('key1', 'value1');
      const items = await storage.getItems<string>(['key1', 'non-existent']);
      expect(items).toEqual({
        key1: 'value1',
        'non-existent': null,
      });
    });
  });

  describe('StorageManager with custom prefix', () => {
    it('should use custom prefix', async () => {
      const customStorage = new StorageManager('custom_');
      await customStorage.setItem('key', 'value');
      const value = await customStorage.getItem('key');
      expect(value).toBe('value');
    });

    it('should isolate keys with different prefixes', async () => {
      const storage1 = new StorageManager('prefix1_');
      const storage2 = new StorageManager('prefix2_');
      await storage1.setItem('key', 'value1');
      await storage2.setItem('key', 'value2');
      expect(await storage1.getItem('key')).toBe('value1');
      expect(await storage2.getItem('key')).toBe('value2');
    });
  });
});
