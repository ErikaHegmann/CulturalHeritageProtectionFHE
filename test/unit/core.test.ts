/**
 * Unit Tests for FHEVM SDK Core Functions
 *
 * Tests the core functionality of the FHEVM SDK including:
 * - Instance creation
 * - Encryption
 * - Decryption
 * - Type inference
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createFhevmInstance,
  encrypt,
  decrypt,
  userDecrypt,
  publicDecrypt,
  encryptBatch,
  decryptBatch,
  FhevmError
} from '@fhevm/sdk';

// Mock fhevmjs
vi.mock('fhevmjs', () => ({
  createInstance: vi.fn(() => Promise.resolve({
    getPublicKey: () => '0xpublickey123...',
    encrypt: vi.fn((type, value) => new Uint8Array([1, 2, 3, 4])),
    decrypt: vi.fn(() => Promise.resolve(42))
  }))
}));

describe('Core FHEVM SDK', () => {
  describe('createFhevmInstance()', () => {
    it('should create FHEVM instance with Sepolia network', async () => {
      const fhevm = await createFhevmInstance({
        network: 'sepolia',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });

      expect(fhevm).toBeDefined();
      expect(fhevm.config.network).toBe('sepolia');
      expect(fhevm.publicKey).toBeDefined();
      expect(fhevm.chainId).toBeDefined();
    });

    it('should create FHEVM instance with localhost network', async () => {
      const fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });

      expect(fhevm).toBeDefined();
      expect(fhevm.config.network).toBe('localhost');
    });

    it('should create FHEVM instance with custom RPC', async () => {
      const fhevm = await createFhevmInstance({
        network: 'custom',
        rpcUrl: 'https://custom-rpc.example.com',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: 12345
      });

      expect(fhevm).toBeDefined();
      expect(fhevm.config.rpcUrl).toBe('https://custom-rpc.example.com');
      expect(fhevm.chainId).toBe(12345);
    });

    it('should throw error for invalid contract address', async () => {
      await expect(
        createFhevmInstance({
          network: 'sepolia',
          contractAddress: 'invalid-address'
        })
      ).rejects.toThrow(FhevmError);
    });

    it('should throw error for custom network without RPC URL', async () => {
      await expect(
        createFhevmInstance({
          network: 'custom',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      ).rejects.toThrow(FhevmError);
    });
  });

  describe('encrypt()', () => {
    let fhevm: any;

    beforeEach(async () => {
      fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
    });

    it('should encrypt euint8 value', async () => {
      const encrypted = await encrypt(fhevm, 42, 'euint8');
      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should encrypt euint16 value', async () => {
      const encrypted = await encrypt(fhevm, 1000, 'euint16');
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should encrypt euint32 value', async () => {
      const encrypted = await encrypt(fhevm, 1000000, 'euint32');
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should encrypt euint64 value', async () => {
      const encrypted = await encrypt(fhevm, BigInt('1000000000'), 'euint64');
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should encrypt ebool value', async () => {
      const encrypted = await encrypt(fhevm, true, 'ebool');
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should auto-infer type for small number (euint8)', async () => {
      const encrypted = await encrypt(fhevm, 42);
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should auto-infer type for medium number (euint16)', async () => {
      const encrypted = await encrypt(fhevm, 1000);
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should auto-infer type for large number (euint32)', async () => {
      const encrypted = await encrypt(fhevm, 1000000);
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should auto-infer type for boolean (ebool)', async () => {
      const encrypted = await encrypt(fhevm, true);
      expect(encrypted).toBeInstanceOf(Uint8Array);
    });

    it('should throw error for null FHEVM instance', async () => {
      await expect(
        encrypt(null as any, 42, 'euint32')
      ).rejects.toThrow();
    });

    it('should throw error for invalid type', async () => {
      await expect(
        encrypt(fhevm, 42, 'invalid-type' as any)
      ).rejects.toThrow();
    });
  });

  describe('encryptBatch()', () => {
    let fhevm: any;

    beforeEach(async () => {
      fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
    });

    it('should encrypt multiple values', async () => {
      const values = [42, 100, 255];
      const encrypted = await encryptBatch(fhevm, values, 'euint8');

      expect(encrypted).toBeInstanceOf(Array);
      expect(encrypted.length).toBe(3);
      encrypted.forEach(enc => {
        expect(enc).toBeInstanceOf(Uint8Array);
      });
    });

    it('should encrypt empty array', async () => {
      const encrypted = await encryptBatch(fhevm, [], 'euint32');
      expect(encrypted).toEqual([]);
    });
  });

  describe('decrypt()', () => {
    let fhevm: any;
    let ciphertext: Uint8Array;

    beforeEach(async () => {
      fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
      ciphertext = await encrypt(fhevm, 42, 'euint32');
    });

    it('should decrypt ciphertext', async () => {
      const decrypted = await decrypt(fhevm, {
        ciphertext,
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });

      expect(decrypted).toBe(42);
    });
  });

  describe('userDecrypt()', () => {
    let fhevm: any;
    let ciphertext: Uint8Array;
    const mockSigner = {
      signTypedData: vi.fn(() => Promise.resolve('0xsignature...'))
    };

    beforeEach(async () => {
      fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
      ciphertext = await encrypt(fhevm, 42, 'euint32');
    });

    it('should decrypt with user signature (EIP-712)', async () => {
      const decrypted = await userDecrypt(fhevm, {
        ciphertext,
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        userAddress: '0xuser123...',
        signer: mockSigner as any
      });

      expect(decrypted).toBe(42);
      expect(mockSigner.signTypedData).toHaveBeenCalled();
    });

    it('should throw error without signer', async () => {
      await expect(
        userDecrypt(fhevm, {
          ciphertext,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          userAddress: '0xuser123...',
          signer: null as any
        })
      ).rejects.toThrow();
    });
  });

  describe('publicDecrypt()', () => {
    let fhevm: any;
    let ciphertext: Uint8Array;

    beforeEach(async () => {
      fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
      ciphertext = await encrypt(fhevm, 42, 'euint32');
    });

    it('should decrypt without signature', async () => {
      const decrypted = await publicDecrypt(fhevm, {
        ciphertext,
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });

      expect(decrypted).toBe(42);
    });
  });

  describe('decryptBatch()', () => {
    let fhevm: any;
    let ciphertexts: Uint8Array[];

    beforeEach(async () => {
      fhevm = await createFhevmInstance({
        network: 'localhost',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
      ciphertexts = await encryptBatch(fhevm, [42, 100, 255], 'euint32');
    });

    it('should decrypt multiple ciphertexts', async () => {
      const decrypted = await decryptBatch(fhevm, {
        ciphertexts,
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });

      expect(decrypted).toEqual([42, 100, 255]);
    });

    it('should decrypt empty array', async () => {
      const decrypted = await decryptBatch(fhevm, {
        ciphertexts: [],
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });

      expect(decrypted).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should create FhevmError with code', () => {
      const error = new FhevmError(
        'Test error',
        'TEST_ERROR_CODE',
        { detail: 'test' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('FhevmError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR_CODE');
      expect(error.details).toEqual({ detail: 'test' });
    });

    it('should throw FhevmError on network failure', async () => {
      await expect(
        createFhevmInstance({
          network: 'custom',
          rpcUrl: 'https://invalid-rpc-endpoint.example.com',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          chainId: 999999
        })
      ).rejects.toThrow(FhevmError);
    });
  });
});
