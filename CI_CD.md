# CI/CD Pipeline Documentation

## Overview

This project implements a comprehensive CI/CD pipeline using GitHub Actions for automated testing, quality checks, and deployment of the Cultural Heritage Protection smart contracts.

---

## Table of Contents

1. [Workflows](#workflows)
2. [Code Quality Tools](#code-quality-tools)
3. [Test Coverage](#test-coverage)
4. [Deployment Process](#deployment-process)
5. [Configuration](#configuration)
6. [Badges](#badges)

---

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/test.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint and Format Check
- Runs Solhint on Solidity contracts
- Checks code formatting with Prettier
- Ensures code quality standards

#### Test on Node.js 18.x
- Runs tests on Node.js 18.x
- Ensures compatibility with LTS version
- Validates contract compilation

#### Test on Node.js 20.x
- Runs tests on Node.js 20.x
- Generates code coverage report
- Uploads coverage to Codecov

#### Security Audit
- Runs `npm audit` to check for vulnerabilities
- Identifies security issues in dependencies

#### Build Contracts
- Compiles contracts
- Generates and uploads artifacts
- Validates successful build

### 2. Deployment Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Manual trigger via GitHub Actions UI (`workflow_dispatch`)

**Features:**
- Deploy to Sepolia testnet
- Automatic contract verification on Etherscan
- Upload deployment artifacts

---

## Code Quality Tools

### Solhint

**Purpose:** Solidity linter for code quality and security

**Configuration:** `.solhint.json`

```json
{
  "extends": "solhint:recommended",
  "rules": {
    "code-complexity": ["error", 8],
    "compiler-version": ["error", "^0.8.24"],
    "func-visibility": ["error", { "ignoreConstructors": true }],
    "max-line-length": ["error", 120]
  }
}
```

**Commands:**
```bash
npm run lint:sol          # Lint Solidity files
npm run lint:sol:fix      # Auto-fix Solidity issues
```

### ESLint

**Purpose:** JavaScript linter for code quality

**Configuration:** `.eslintrc.json`

**Commands:**
```bash
npm run lint:js           # Lint JavaScript files
npm run lint:js:fix       # Auto-fix JavaScript issues
npm run lint              # Lint all files
```

### Prettier

**Purpose:** Code formatter for consistent style

**Configuration:** `.prettierrc.json`

**Commands:**
```bash
npm run format            # Format all files
npm run format:check      # Check formatting without changes
```

---

## Test Coverage

### Codecov Integration

**Configuration:** `.codecov.yml`

**Coverage Targets:**
- Project coverage: 80% target
- Patch coverage: 80% target
- Threshold: 5% allowed drop

**Features:**
- Automatic coverage reports on PRs
- Visual coverage diff
- Coverage badges

**Setup:**
1. Sign up at [codecov.io](https://codecov.io)
2. Add repository to Codecov
3. Add `CODECOV_TOKEN` to GitHub Secrets
4. Coverage reports will be automatically uploaded

### Generate Coverage Locally

```bash
npm run coverage
```

**Output:**
- `coverage/` directory with HTML reports
- `coverage/lcov.info` for Codecov
- Terminal summary

---

## Deployment Process

### Manual Deployment via GitHub Actions

1. Navigate to **Actions** tab in GitHub
2. Select **Deploy to Sepolia** workflow
3. Click **Run workflow**
4. Select environment (sepolia/localhost)
5. Monitor deployment progress

### Deployment Artifacts

After successful deployment:
- Contract addresses saved to `deployments/`
- Etherscan verification completed
- Deployment info available as workflow artifact

### Required Secrets

Configure these in GitHub Repository Settings → Secrets:

```
SEPOLIA_RPC_URL         # Infura or Alchemy RPC endpoint
PRIVATE_KEY             # Deployer wallet private key
ETHERSCAN_API_KEY       # For contract verification
CODECOV_TOKEN           # For coverage reports (optional)
```

---

## Configuration Files

### GitHub Actions

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | Main CI/CD pipeline |
| `.github/workflows/deploy.yml` | Deployment workflow |

### Code Quality

| File | Purpose |
|------|---------|
| `.solhint.json` | Solidity linter configuration |
| `.solhintignore` | Files to ignore for Solhint |
| `.eslintrc.json` | JavaScript linter configuration |
| `.eslintignore` | Files to ignore for ESLint |
| `.prettierrc.json` | Code formatter configuration |
| `.prettierignore` | Files to ignore for Prettier |

### Coverage

| File | Purpose |
|------|---------|
| `.codecov.yml` | Codecov configuration |

---

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

---

## Local Development Commands

### Quality Checks

```bash
# Run all linters
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage

# Run tests with gas reporting
npm run gas-report
```

### Pre-commit Checklist

Before pushing code:

1. ✅ Run linters: `npm run lint`
2. ✅ Format code: `npm run format`
3. ✅ Run tests: `npm test`
4. ✅ Check coverage: `npm run coverage`
5. ✅ Compile contracts: `npm run compile`

---

## CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────┐
│         Push to main/develop or PR              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Lint and Format Check                  │
│  • Solhint (Solidity)                          │
│  • Prettier (Code formatting)                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Parallel Testing                       │
│  • Node.js 18.x ──────┐                        │
│  • Node.js 20.x ──────┤                        │
│  • Security Audit ────┘                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Coverage Report                        │
│  • Generate coverage                            │
│  • Upload to Codecov                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Build Contracts                        │
│  • Compile contracts                            │
│  • Upload artifacts                             │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Common Issues

#### 1. Linting Failures

**Problem:** Solhint or ESLint errors

**Solution:**
```bash
npm run lint:fix
```

#### 2. Formatting Issues

**Problem:** Prettier check fails

**Solution:**
```bash
npm run format
```

#### 3. Test Failures

**Problem:** Tests fail in CI but pass locally

**Solution:**
- Check Node.js version matches CI (18.x or 20.x)
- Ensure all dependencies are installed: `npm ci`
- Check environment variables

#### 4. Coverage Upload Failed

**Problem:** Codecov upload fails

**Solution:**
- Verify `CODECOV_TOKEN` is set in GitHub Secrets
- Check Codecov repository is properly configured
- Review workflow logs for specific error

#### 5. Deployment Fails

**Problem:** Deployment workflow fails

**Solution:**
- Verify all secrets are configured correctly
- Check RPC endpoint is accessible
- Ensure wallet has sufficient funds
- Review deployment logs

---

## Best Practices

### 1. Branch Protection

Configure branch protection rules:
- Require status checks before merging
- Require up-to-date branches
- Require review from code owners
- Restrict force pushes

### 2. Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR
4. Wait for CI checks to pass
5. Request code review
6. Merge after approval

### 3. Commit Messages

Use conventional commits:
```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
chore: update dependencies
refactor: improve code structure
```

### 4. Testing Strategy

- Write tests before code (TDD)
- Aim for >80% coverage
- Test edge cases
- Include integration tests

---

## Monitoring and Alerts

### GitHub Actions

- Monitor workflow runs in Actions tab
- Set up email notifications for failures
- Review workflow logs for issues

### Codecov

- Review coverage reports on PRs
- Monitor coverage trends
- Set up notifications for coverage drops

---

## Continuous Improvement

### Planned Enhancements

1. **Performance Testing**
   - Add gas benchmarking
   - Monitor contract size

2. **Security Scanning**
   - Integrate Slither for static analysis
   - Add Mythril for security checks

3. **Automated Releases**
   - Semantic versioning
   - Automated changelog generation

4. **Multi-environment Testing**
   - Test on multiple networks
   - Automated staging deployments

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Codecov Documentation](https://docs.codecov.com/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

**Last Updated:** 2024-10-28
**CI/CD Version:** 1.0.0
