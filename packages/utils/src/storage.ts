/* eslint-disable @typescript-eslint/no-explicit-any */

import localforage from 'localforage';

// Shared memory storage for server-side usage
const memoryStorage = new Map<string, any>();

// Check if we're in server environment
const isServer = typeof window === 'undefined';

// Server-side storage implementation (bypasses localforage entirely)
class ServerStorage {
  private storage: Map<string, any>;

  constructor() {
    this.storage = memoryStorage;
  }

  public async getItem<T>(key: string): Promise<T | null> {
    return Promise.resolve((this.storage.get(key) ?? null) as T | null);
  }

  public async setItem<T>(key: string, value: T): Promise<T> {
    this.storage.set(key, value);
    return Promise.resolve(value);
    return value;
  }

  public async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }

  public async clear(): Promise<void> {
    this.storage.clear();
    return Promise.resolve();
  }

  public async length(): Promise<number> {
    return Promise.resolve(this.storage.size);
  }

  public async keys(): Promise<string[]> {
    return Promise.resolve(Array.from(this.storage.keys()));
  }
}

// Initialize storage adapter based on environment
let storageAdapter: {
  getItem: <T>(key: string) => Promise<T | null>;
  setItem: <T>(key: string, value: T) => Promise<T>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  length: () => Promise<number>;
  keys: () => Promise<string[]>;
};

if (isServer) {
  // Server-side: Use direct memory storage, bypass localforage completely
  // This avoids all the async initialization issues with localforage drivers
  const serverStorage = new ServerStorage();
  storageAdapter = {
    getItem: <T>(key: string) => serverStorage.getItem<T>(key),
    setItem: <T>(key: string, value: T) => serverStorage.setItem<T>(key, value),
    removeItem: (key: string) => serverStorage.removeItem(key),
    clear: () => serverStorage.clear(),
    length: () => serverStorage.length(),
    keys: () => serverStorage.keys(),
  };
} else {
  // Client-side: Configure localforage to use IndexedDB
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'Aipt',
    version: 1,
    storeName: 'aipt_storage',
    description: 'application storage',
  });

  // Client-side: Use localforage directly
  storageAdapter = {
    getItem: <T>(key: string) => localforage.getItem<T>(key),
    setItem: <T>(key: string, value: T) => localforage.setItem<T>(key, value),
    removeItem: (key: string) => localforage.removeItem(key),
    clear: () => localforage.clear(),
    length: () => localforage.length(),
    keys: () => localforage.keys(),
  };
}

// Storage prefix
const STORAGE_PREFIX = 'aipt_';

/**
 * Storage utility class with prefix support
 */
class StorageManager {
  private readonly prefix: string;

  constructor(prefix: string = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  /**
   * Generate prefixed key name
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set storage item
   */
  public async setItem<T>(key: string, value: T): Promise<T> {
    try {
      const prefixedKey = this.getKey(key);
      return await storageAdapter.setItem(prefixedKey, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  /**
   * Get storage item
   */
  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const prefixedKey = this.getKey(key);
      return await storageAdapter.getItem<T>(prefixedKey);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  /**
   * Remove storage item
   */
  public async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getKey(key);
      await storageAdapter.removeItem(prefixedKey);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  /**
   * Clear all storage items
   */
  public async clear(): Promise<void> {
    try {
      // On server, only clear keys with our prefix
      if (isServer) {
        const allKeys = await storageAdapter.keys();
        const keysToRemove = allKeys.filter((key) => key.startsWith(this.prefix));
        await Promise.all(keysToRemove.map((key) => storageAdapter.removeItem(key)));
      } else {
        await storageAdapter.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  /**
   * Get storage items count
   */
  public async length(): Promise<number> {
    try {
      if (isServer) {
        const allKeys = await storageAdapter.keys();
        return allKeys.filter((key) => key.startsWith(this.prefix)).length;
      }
      return await storageAdapter.length();
    } catch (error) {
      console.error('Storage length error:', error);
      return 0;
    }
  }

  /**
   * Get all keys
   */
  public async keys(): Promise<string[]> {
    try {
      const allKeys = await storageAdapter.keys();
      // Filter keys with prefix and remove prefix
      return allKeys
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  public async hasItem(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.getKey(key);
      const value = await storageAdapter.getItem(prefixedKey);
      return value !== null;
    } catch (error) {
      console.error('Storage hasItem error:', error);
      return false;
    }
  }

  /**
   * Set multiple storage items
   */
  public async setItems(items: Record<string, unknown>): Promise<void> {
    try {
      const promises = Object.entries(items).map(([key, value]) => this.setItem(key, value));
      await Promise.all(promises);
    } catch (error) {
      console.error('Storage setItems error:', error);
      throw error;
    }
  }

  /**
   * Get multiple storage items
   */
  public async getItems<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const result: Record<string, T | null> = {};
      const promises = keys.map(async (key) => {
        const value = await this.getItem<T>(key);
        result[key] = value;
      });
      await Promise.all(promises);
      return result;
    } catch (error) {
      console.error('Storage getItems error:', error);
      return {};
    }
  }
}

// Create default storage manager instance
export const storage = new StorageManager();

// Export class to allow creating instances with custom prefix
export { StorageManager };

// Export localforage instance for advanced usage (client-side only)
export { default as localforage } from 'localforage';

// Compatibility: Provide synchronous interface similar to localStorage (not recommended)
export const localStorageCompat = {
  setItem: (key: string, value: string) => {
    storage.setItem(key, value).catch(console.error);
  },
  getItem: (key: string): string | null => {
    // Note: This is an async operation, but provides a sync interface for compatibility
    // In practice, it's recommended to use storage.getItem
    let result: string | null = null;
    storage
      .getItem<string>(key)
      .then((value) => {
        result = value;
      })
      .catch(console.error);
    return result;
  },
  removeItem: (key: string) => {
    storage.removeItem(key).catch(console.error);
  },
  clear: () => {
    storage.clear().catch(console.error);
  },
};
