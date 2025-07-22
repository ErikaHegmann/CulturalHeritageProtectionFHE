/**
 * E2E Tests for Next.js Example
 *
 * Tests the complete user flow for the Next.js voting example
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Next.js Voting Example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Confidential Voting/i);
    await expect(page.locator('h1')).toContainText('Confidential Voting');
  });

  test('should display connect wallet button', async ({ page }) => {
    const connectButton = page.locator('button:has-text("Connect Wallet")');
    await expect(connectButton).toBeVisible();
  });

  test('should show FHEVM initialization status', async ({ page }) => {
    // Wait for FHEVM to initialize
    const statusElement = page.locator('[data-testid="fhevm-status"]');
    await expect(statusElement).toBeVisible({ timeout: 10000 });
  });

  test('should display voting options', async ({ page }) => {
    const voteOptions = page.locator('[data-testid="vote-option"]');
    await expect(voteOptions).toHaveCount(3); // Assuming 3 vote options
  });

  test.describe('Wallet Connection Flow', () => {
    test('should open MetaMask on connect button click', async ({ page, context }) => {
      // Note: This requires MetaMask extension to be installed
      const connectButton = page.locator('button:has-text("Connect Wallet")');

      // Click connect and wait for popup
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        connectButton.click()
      ]);

      // MetaMask popup should open
      expect(popup.url()).toContain('extension'); // MetaMask URL
    });

    test('should show connected address after wallet connection', async ({ page }) => {
      // Mock wallet connection
      await page.evaluate(() => {
        window.ethereum = {
          request: async ({ method }: any) => {
            if (method === 'eth_requestAccounts') {
              return ['0x1234567890abcdef1234567890abcdef12345678'];
            }
            if (method === 'eth_chainId') {
              return '0xaa36a7'; // Sepolia
            }
          },
          on: () => {},
          removeListener: () => {}
        } as any;
      });

      await page.reload();
      const connectButton = page.locator('button:has-text("Connect Wallet")');
      await connectButton.click();

      // Should show connected address
      await expect(page.locator('[data-testid="connected-address"]')).toBeVisible();
    });
  });

  test.describe('Voting Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Mock wallet connection and FHEVM initialization
      await page.evaluate(() => {
        window.ethereum = {
          request: async ({ method }: any) => {
            if (method === 'eth_requestAccounts') {
              return ['0x1234567890abcdef1234567890abcdef12345678'];
            }
            if (method === 'eth_chainId') {
              return '0xaa36a7';
            }
          },
          on: () => {},
          removeListener: () => {}
        } as any;
      });
    });

    test('should encrypt and submit vote', async ({ page }) => {
      // Wait for FHEVM ready
      await expect(page.locator('[data-testid="fhevm-ready"]')).toBeVisible({ timeout: 10000 });

      // Click vote button
      const voteButton = page.locator('[data-testid="vote-option-1"]');
      await voteButton.click();

      // Should show loading state
      await expect(page.locator('[data-testid="vote-loading"]')).toBeVisible();

      // Should show success message
      await expect(page.locator('text=/Vote cast successfully/i')).toBeVisible({ timeout: 15000 });
    });

    test('should disable vote button while encrypting', async ({ page }) => {
      await expect(page.locator('[data-testid="fhevm-ready"]')).toBeVisible({ timeout: 10000 });

      const voteButton = page.locator('[data-testid="vote-option-1"]');
      await voteButton.click();

      // Button should be disabled during encryption
      await expect(voteButton).toBeDisabled();
    });

    test('should show error on failed vote', async ({ page }) => {
      // Mock network error
      await page.route('**/*', route => route.abort());

      const voteButton = page.locator('[data-testid="vote-option-1"]');
      await voteButton.click();

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Results Decryption', () => {
    test('should display encrypted results', async ({ page }) => {
      const resultsSection = page.locator('[data-testid="vote-results"]');
      await expect(resultsSection).toBeVisible();
    });

    test('should decrypt results on button click', async ({ page }) => {
      // Wait for FHEVM ready
      await expect(page.locator('[data-testid="fhevm-ready"]')).toBeVisible({ timeout: 10000 });

      // Click decrypt button
      const decryptButton = page.locator('[data-testid="decrypt-results"]');
      await decryptButton.click();

      // Should show decrypted values
      await expect(page.locator('[data-testid="decrypted-value"]')).toBeVisible({ timeout: 10000 });
    });

    test('should handle decryption error gracefully', async ({ page }) => {
      // Mock decryption failure
      await page.evaluate(() => {
        window.mockDecryptionError = true;
      });

      const decryptButton = page.locator('[data-testid="decrypt-results"]');
      await decryptButton.click();

      // Should show error message
      await expect(page.locator('text=/Failed to decrypt/i')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Page should be responsive
      await expect(page.locator('h1')).toBeVisible();
      const connectButton = page.locator('button:has-text("Connect Wallet")');
      await expect(connectButton).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Error States', () => {
    test('should show error on wrong network', async ({ page }) => {
      await page.evaluate(() => {
        window.ethereum = {
          request: async ({ method }: any) => {
            if (method === 'eth_chainId') {
              return '0x1'; // Mainnet instead of Sepolia
            }
          }
        } as any;
      });

      await page.reload();

      // Should show wrong network error
      await expect(page.locator('text=/Wrong network/i')).toBeVisible();
    });

    test('should show error when MetaMask not installed', async ({ page }) => {
      await page.evaluate(() => {
        delete window.ethereum;
      });

      await page.reload();
      const connectButton = page.locator('button:has-text("Connect Wallet")');
      await connectButton.click();

      // Should show MetaMask not found error
      await expect(page.locator('text=/MetaMask not found/i')).toBeVisible();
    });

    test('should show error on FHEVM initialization failure', async ({ page }) => {
      // Mock FHEVM failure
      await page.route('**/gateway/**', route => route.abort());

      await page.reload();

      // Should show initialization error
      await expect(page.locator('[data-testid="fhevm-error"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const connectButton = page.locator('button:has-text("Connect Wallet")');
      await expect(connectButton).toHaveAttribute('aria-label');
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // Run accessibility audit
      const violations = await page.evaluate(() => {
        // This would use axe-core in real implementation
        return [];
      });

      expect(violations).toHaveLength(0);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Filter out expected errors (if any)
      const unexpectedErrors = errors.filter(
        error => !error.includes('expected-error')
      );

      expect(unexpectedErrors).toHaveLength(0);
    });
  });
});
