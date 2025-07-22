/**
 * Test Helper Utilities
 *
 * Provides utility functions for testing
 */

import { vi } from 'vitest';
import { mockFhevmInstance, mockSigner, mockProvider } from '../fixtures/mockData';

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await sleep(interval);
  }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock FHEVM instance with custom behavior
 */
export function mockFhevmWithBehavior(behavior: {
  encrypt?: (type: string, value: any) => Uint8Array;
  decrypt?: (ciphertext: Uint8Array) => Promise<any>;
  getPublicKey?: () => string;
}) {
  return {
    ...mockFhevmInstance,
    instance: {
      ...mockFhevmInstance.instance,
      ...behavior
    }
  };
}

/**
 * Mock wallet connection
 */
export function mockWalletConnection(connected = true) {
  if (typeof window === 'undefined') {
    global.window = {} as any;
  }

  window.ethereum = {
    isMetaMask: true,
    request: vi.fn(async ({ method }: any) => {
      if (!connected && method === 'eth_requestAccounts') {
        throw new Error('User rejected request');
      }

      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return ['0x1234567890abcdef1234567890abcdef12345678'];
        case 'eth_chainId':
          return '0x7a69'; // localhost
        default:
          return null;
      }
    }),
    on: vi.fn(),
    removeListener: vi.fn()
  } as any;
}

/**
 * Mock network switch
 */
export function mockNetworkSwitch(chainId: number) {
  if (window.ethereum) {
    (window.ethereum.request as any) = vi.fn(async ({ method }: any) => {
      if (method === 'eth_chainId') {
        return `0x${chainId.toString(16)}`;
      }
      return null;
    });
  }
}

/**
 * Create mock transaction response
 */
export function mockTransactionResponse(success = true) {
  return {
    hash: '0xtxhash123',
    wait: vi.fn(async () => ({
      status: success ? 1 : 0,
      blockNumber: 12346,
      transactionHash: '0xtxhash123',
      logs: []
    }))
  };
}

/**
 * Mock contract call
 */
export function mockContractCall(returnValue: any) {
  return vi.fn(async () => returnValue);
}

/**
 * Generate random encrypted data
 */
export function generateRandomEncryptedData(length = 32): Uint8Array {
  return new Uint8Array(length).map(() => Math.floor(Math.random() * 256));
}

/**
 * Assert encrypted data format
 */
export function assertEncryptedData(data: any): asserts data is Uint8Array {
  if (!(data instanceof Uint8Array)) {
    throw new Error('Expected Uint8Array encrypted data');
  }
  if (data.length === 0) {
    throw new Error('Encrypted data cannot be empty');
  }
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = { ...console };

  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();

  return {
    restore: () => {
      Object.assign(console, originalConsole);
    },
    getLogs: () => (console.log as any).mock.calls,
    getErrors: () => (console.error as any).mock.calls,
    getWarns: () => (console.warn as any).mock.calls
  };
}

/**
 * Create test timeout
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Test timeout after ${ms}ms`)), ms);
  });
}

/**
 * Suppress expected errors
 */
export function suppressExpectedError(error: Error, expectedMessages: string[]) {
  return expectedMessages.some(msg => error.message.includes(msg));
}

/**
 * Wait for async state updates (React)
 */
export async function flushPromises() {
  await new Promise(resolve => setImmediate(resolve));
}

/**
 * Create mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    getStore: () => ({ ...store })
  };
}

/**
 * Verify function call order
 */
export function verifyCallOrder(mocks: any[], expectedOrder: string[]) {
  const calls = mocks.flatMap((mock, idx) =>
    mock.mock.calls.map(() => expectedOrder[idx])
  );

  return JSON.stringify(calls) === JSON.stringify(expectedOrder);
}

/**
 * Create mock event emitter
 */
export function createMockEventEmitter() {
  const listeners: Record<string, Function[]> = {};

  return {
    on: (event: string, handler: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    off: (event: string, handler: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    },
    emit: (event: string, ...args: any[]) => {
      if (listeners[event]) {
        listeners[event].forEach(handler => handler(...args));
      }
    },
    getListeners: (event: string) => listeners[event] || []
  };
}

/**
 * Performance measurement helper
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const result = await operation();
  const duration = performance.now() - startTime;

  return { result, duration };
}

/**
 * Batch test data generator
 */
export function generateTestData(count: number, generator: (index: number) => any) {
  return Array.from({ length: count }, (_, i) => generator(i));
}

/**
 * Deep clone for test data
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Assert array equality (order-independent)
 */
export function assertArrayEquality<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays have different lengths');
  }

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  sorted1.forEach((item, index) => {
    if (item !== sorted2[index]) {
      throw new Error(`Arrays differ at index ${index}`);
    }
  });
}

/**
 * Create retry helper for flaky tests
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
