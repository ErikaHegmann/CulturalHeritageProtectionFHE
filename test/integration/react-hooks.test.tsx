/**
 * Integration Tests for React Hooks
 *
 * Tests the integration between React hooks and core SDK functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useFhevm,
  useEncrypt,
  useDecrypt,
  useContract,
  FhevmProvider,
  useFhevmContext
} from '@fhevm/sdk/react';
import React from 'react';

// Mock fhevmjs
vi.mock('fhevmjs', () => ({
  createInstance: vi.fn(() => Promise.resolve({
    getPublicKey: () => '0xpublickey123...',
    encrypt: vi.fn((type, value) => new Uint8Array([1, 2, 3, 4])),
    decrypt: vi.fn(() => Promise.resolve(42))
  }))
}));

describe('React Hooks Integration', () => {
  describe('useFhevm()', () => {
    it('should initialize FHEVM instance', async () => {
      const { result } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.fhevm).toBeNull();

      await waitFor(() => expect(result.current.isReady).toBe(true), {
        timeout: 5000
      });

      expect(result.current.fhevm).not.toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle initialization error', async () => {
      const { result } = renderHook(() =>
        useFhevm({
          network: 'sepolia',
          contractAddress: 'invalid-address'
        })
      );

      await waitFor(() => expect(result.current.error).not.toBeNull(), {
        timeout: 5000
      });

      expect(result.current.fhevm).toBeNull();
      expect(result.current.isReady).toBe(false);
    });

    it('should support refetch', async () => {
      const { result } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      act(() => {
        result.current.refetch();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isReady).toBe(true));
    });
  });

  describe('useEncrypt()', () => {
    it('should encrypt value when FHEVM is ready', async () => {
      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      const { result: encryptResult } = renderHook(() =>
        useEncrypt(fhevmResult.current.fhevm)
      );

      let encrypted: Uint8Array | undefined;
      await act(async () => {
        encrypted = await encryptResult.current.encrypt(42, 'euint32');
      });

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encryptResult.current.error).toBeNull();
    });

    it('should handle encryption error', async () => {
      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      const { result: encryptResult } = renderHook(() =>
        useEncrypt(fhevmResult.current.fhevm)
      );

      await act(async () => {
        try {
          await encryptResult.current.encrypt(null as any, 'euint32');
        } catch (error) {
          // Expected error
        }
      });

      expect(encryptResult.current.error).not.toBeNull();
    });

    it('should track loading state', async () => {
      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      const { result: encryptResult } = renderHook(() =>
        useEncrypt(fhevmResult.current.fhevm)
      );

      expect(encryptResult.current.isEncrypting).toBe(false);

      act(() => {
        encryptResult.current.encrypt(42, 'euint32');
      });

      // Check loading state during encryption
      expect(encryptResult.current.isEncrypting).toBe(true);

      await waitFor(() => expect(encryptResult.current.isEncrypting).toBe(false));
    });
  });

  describe('useDecrypt()', () => {
    let ciphertext: Uint8Array;

    beforeEach(async () => {
      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      const { result: encryptResult } = renderHook(() =>
        useEncrypt(fhevmResult.current.fhevm)
      );

      await act(async () => {
        ciphertext = await encryptResult.current.encrypt(42, 'euint32');
      });
    });

    it('should decrypt with public decrypt', async () => {
      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      const { result: decryptResult } = renderHook(() =>
        useDecrypt(fhevmResult.current.fhevm)
      );

      let decrypted: number | undefined;
      await act(async () => {
        decrypted = await decryptResult.current.publicDecrypt({
          ciphertext,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        });
      });

      expect(decrypted).toBe(42);
    });

    it('should decrypt with user decrypt', async () => {
      const mockSigner = {
        signTypedData: vi.fn(() => Promise.resolve('0xsignature...'))
      };

      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      const { result: decryptResult } = renderHook(() =>
        useDecrypt(fhevmResult.current.fhevm)
      );

      let decrypted: number | undefined;
      await act(async () => {
        decrypted = await decryptResult.current.userDecrypt({
          ciphertext,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          userAddress: '0xuser123...',
          signer: mockSigner as any
        });
      });

      expect(decrypted).toBe(42);
      expect(mockSigner.signTypedData).toHaveBeenCalled();
    });
  });

  describe('FhevmProvider + useFhevmContext()', () => {
    it('should provide FHEVM context to children', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FhevmProvider
          config={{
            network: 'localhost',
            contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
          }}
        >
          {children}
        </FhevmProvider>
      );

      const { result } = renderHook(() => useFhevmContext(), { wrapper });

      await waitFor(() => expect(result.current.isReady).toBe(true));

      expect(result.current.fhevm).not.toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useFhevmContext());
      }).toThrow();
    });
  });

  describe('Hook Integration Flow', () => {
    it('should complete full encrypt-decrypt flow', async () => {
      // 1. Initialize FHEVM
      const { result: fhevmResult } = renderHook(() =>
        useFhevm({
          network: 'localhost',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        })
      );

      await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

      // 2. Encrypt value
      const { result: encryptResult } = renderHook(() =>
        useEncrypt(fhevmResult.current.fhevm)
      );

      let ciphertext: Uint8Array | undefined;
      await act(async () => {
        ciphertext = await encryptResult.current.encrypt(42, 'euint32');
      });

      expect(ciphertext).toBeInstanceOf(Uint8Array);

      // 3. Decrypt value
      const { result: decryptResult } = renderHook(() =>
        useDecrypt(fhevmResult.current.fhevm)
      );

      let decrypted: number | undefined;
      await act(async () => {
        decrypted = await decryptResult.current.publicDecrypt({
          ciphertext: ciphertext!,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
        });
      });

      expect(decrypted).toBe(42);
    });
  });
});
