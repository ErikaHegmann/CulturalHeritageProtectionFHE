/**
 * Test Setup File
 *
 * Configures the testing environment and mocks
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.ethereum
global.window.ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = vi.fn();

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn()
};

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length)
  } as any;
}

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  }
});

// Mock FHEVM instance creation for tests
vi.mock('fhevmjs', () => ({
  createInstance: vi.fn(() => Promise.resolve({
    getPublicKey: () => '0xmockpublickey',
    encrypt: vi.fn((type, value) => {
      // Return mock encrypted data
      return new Uint8Array([1, 2, 3, 4, 5]);
    }),
    decrypt: vi.fn(() => Promise.resolve(42)),
    createEIP712: vi.fn(() => ({
      domain: { name: 'FHE', version: '1' },
      types: { Decrypt: [] },
      message: {}
    }))
  }))
}));

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: vi.fn(() => ({
      getNetwork: vi.fn(() => Promise.resolve({ chainId: BigInt(31337) })),
      getSigner: vi.fn(() => ({
        signTypedData: vi.fn(() => Promise.resolve('0xmocksignature'))
      }))
    })),
    Contract: vi.fn(() => ({
      castVote: vi.fn(() => Promise.resolve({ wait: vi.fn() })),
      getResults: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3])))
    })),
    BrowserProvider: vi.fn()
  }
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NETWORK = 'localhost';
process.env.CONTRACT_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

console.log('✅ Test environment setup complete');
