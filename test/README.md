# FHEVM SDK Test Suite

This directory contains test files for the Universal FHEVM SDK.

## Test Structure

```
test/
├── unit/           # Unit tests for core functions
├── integration/    # Integration tests for hooks and adapters
├── e2e/            # End-to-end tests for examples
├── fixtures/       # Test fixtures and mock data
├── utils/          # Test utilities and helpers
└── README.md       # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### E2E Tests Only
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Frameworks

- **Vitest** - Fast unit test runner
- **React Testing Library** - React hooks testing
- **Playwright** - E2E testing
- **Mock Service Worker** - API mocking

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { encrypt, createFhevmInstance } from '@fhevm/sdk';

describe('encrypt()', () => {
  it('should encrypt a number correctly', async () => {
    const fhevm = await createFhevmInstance({
      network: 'localhost',
      contractAddress: '0x123...'
    });

    const value = 42;
    const encrypted = await encrypt(fhevm, value, 'euint32');

    expect(encrypted).toBeInstanceOf(Uint8Array);
    expect(encrypted.length).toBeGreaterThan(0);
  });

  it('should auto-infer type for small numbers', async () => {
    const fhevm = await createFhevmInstance({
      network: 'localhost',
      contractAddress: '0x123...'
    });

    const encrypted = await encrypt(fhevm, 42);
    expect(encrypted).toBeInstanceOf(Uint8Array);
  });
});
```

### Integration Test Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

describe('useFhevm + useEncrypt integration', () => {
  it('should encrypt after FHEVM is ready', async () => {
    const { result: fhevmResult } = renderHook(() =>
      useFhevm({ network: 'localhost', contractAddress: '0x123...' })
    );

    await waitFor(() => expect(fhevmResult.current.isReady).toBe(true));

    const { result: encryptResult } = renderHook(() =>
      useEncrypt(fhevmResult.current.fhevm)
    );

    const encrypted = await encryptResult.current.encrypt(42, 'euint32');
    expect(encrypted).toBeInstanceOf(Uint8Array);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('Next.js voting example', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Connect wallet
  await page.click('button:has-text("Connect Wallet")');

  // Wait for MetaMask
  await page.waitForSelector('text=Connected');

  // Cast vote
  await page.click('button:has-text("Vote Option A")');
  await page.waitForSelector('text=Vote cast successfully');

  expect(await page.textContent('.vote-count')).toContain('1');
});
```

## Test Coverage Goals

- **Unit Tests:** > 80% coverage
- **Integration Tests:** All hooks covered
- **E2E Tests:** All examples covered
- **Critical Paths:** 100% coverage

## Continuous Integration

Tests run automatically on:
- Every commit (unit tests)
- Pull requests (all tests)
- Before deployment (E2E tests)

## Test Data

Test fixtures are located in `test/fixtures/`:
- Mock FHEVM instances
- Sample encrypted data
- Test contract addresses
- Mock wallet providers

## Troubleshooting

### Tests Timeout
Increase timeout in `vitest.config.ts`:
```typescript
export default {
  test: {
    testTimeout: 30000
  }
}
```

### MetaMask Not Found
Install MetaMask extension for E2E tests or use mock provider.

### Network Connection Issues
Ensure local Hardhat node is running:
```bash
npx hardhat node
```

## Contributing Tests

1. Write tests for new features
2. Ensure existing tests pass
3. Add integration tests for hooks
4. Update fixtures if needed
5. Document test patterns

---

**Test Status:** Setup Complete
**Coverage Target:** 80%+
**CI Integration:** Pending
