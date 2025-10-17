import { describe, it, expect } from 'vitest';
import { storage, auth } from './firebase';

describe('Firebase Configuration', () => {
  it('should export storage instance', () => {
    expect(storage).toBeDefined();
    expect(storage).toHaveProperty('app');
  });

  it('should export auth instance', () => {
    expect(auth).toBeDefined();
    expect(auth).toHaveProperty('app');
  });

  it('should have auth and storage sharing the same app instance', () => {
    expect(storage.app).toBe(auth.app);
  });
});
