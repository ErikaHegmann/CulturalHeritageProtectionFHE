# 🏛️ Cultural Heritage Protection

> Privacy-preserving cultural artifact management using Fully Homomorphic Encryption (FHE) on Ethereum

[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://cultural-heritage-protection-fhe.vercel.app)
[![GitHub](https://img.shields.io/badge/github-repository-blue.svg)](https://github.com/ErikaHegmann/CulturalHeritageProtectionFHE)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-brightgreen.svg)](https://soliditylang.org/)
[![Network](https://img.shields.io/badge/network-Sepolia-orange.svg)](https://sepolia.etherscan.io/)

A blockchain-based platform leveraging **Fully Homomorphic Encryption (FHE)** to protect sensitive cultural heritage artifact information while maintaining transparency and accessibility. Built with **Zama FHEVM** technology for real-world privacy-preserving applications on Ethereum.

**🌐 [Live Application](https://cultural-heritage-protection-fhe.vercel.app)** | **📂 [GitHub Repository](https://github.com/ErikaHegmann/CulturalHeritageProtectionFHE)** | **🎥 Demo Video: `demo.mp4` (Download to watch)**

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
  - [Why Privacy Matters for Cultural Heritage](#why-privacy-matters-for-cultural-heritage)
  - [Related Example Applications](#related-example-applications)
- [Core Concepts](#-core-concepts)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#️-architecture)
- [FHE Privacy Model](#-fhe-privacy-model)
- [Tech Stack](#-tech-stack)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#️-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Project Overview

Cultural Heritage Protection is a decentralized application that addresses the critical need for **privacy in cultural heritage data management**. Using Zama's Fully Homomorphic Encryption (FHE) technology, the system enables:

- **Confidential artifact registration** with encrypted metadata
- **Private ownership records** while maintaining provenance
- **Selective disclosure** for authorized parties only
- **Privacy-preserving valuations** and authenticity verification
- **Anonymous reporting** of threats to cultural heritage

### Why Privacy Matters for Cultural Heritage

Cultural heritage artifacts often require confidential handling:

- **Security**: Exact locations and valuations must remain private to prevent theft
- **Ownership Privacy**: Sensitive ownership information and provenance
- **Authenticity**: Confidential authentication processes
- **Market Sensitivity**: Private appraisals and valuations
- **Legal Protection**: Confidential legal and insurance documentation

### Related Example Applications

This repository includes multiple implementations demonstrating FHE technology in different contexts:

#### 🔒 Privacy Quality Inspection System
**Location**: `./quality-testing-app/`

A privacy-preserving quality inspection platform built with React and the Universal FHEVM SDK, demonstrating FHE applications in manufacturing and quality control:

- **Technology**: React 18 + Vite + TypeScript + @fhevm/sdk
- **Use Case**: Anonymous quality testing with encrypted inspection data
- **Features**:
  - Encrypted quality scores (0-100) using `euint8`
  - Anonymous defect count tracking using `euint8`
  - Confidential batch number identification using `euint32`
  - Role-based inspector authorization system
  - Multi-category support (Electronics, Automotive, Pharmaceutical, etc.)
  - Real-time blockchain verification

**Contract**: `0xB867082d753197aeAf0E3523FE993Eae79F45342` on Sepolia

**Setup**:
```bash
cd quality-testing-app
npm install
npm run dev
```

**Key SDK Integration**:
```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

const { fhevm, isReady } = useFhevm({
  network: 'sepolia',
  contractAddress: CONTRACT_ADDRESS
});

const { encrypt } = useEncrypt(fhevm);

// Encrypt quality inspection data
const encryptedScore = await encrypt(qualityScore, 'euint8');
const encryptedDefects = await encrypt(defectCount, 'euint8');
const encryptedBatch = await encrypt(batchNumber, 'euint32');
```

This example showcases how the same FHE technology can be applied across different industries, from cultural heritage protection to manufacturing quality control, demonstrating the versatility and power of privacy-preserving smart contracts.

---

## 🧠 Core Concepts

### What is FHE (Fully Homomorphic Encryption)?

FHE is a revolutionary cryptographic technology that allows computations to be performed **directly on encrypted data** without requiring decryption. This means:

- **Data remains encrypted** during processing
- **Computations happen on ciphertext**, not plaintext
- **Results are also encrypted** and can only be decrypted by authorized parties
- **Zero knowledge exposure** throughout the entire workflow

### FHE in Cultural Heritage Protection

This system uses FHE smart contracts to manage cultural artifact data with complete privacy:

```
User Input (Plaintext) → FHE Encryption → Blockchain Storage (Ciphertext)
                                              ↓
                                     Smart Contract Operations
                                          (On Encrypted Data)
                                              ↓
                                   Authorized Decryption Only
                                              ↓
                                   Decrypted Results (Plaintext)
```

### Privacy-Preserving Artifact Management

**What's Encrypted (Private):**
- Artifact ID and identification numbers
- Category and classification
- Age, period, and historical context
- Condition ratings and assessments
- Estimated values and appraisals
- Owner identity (when using encrypted addresses)
- Authenticity status and verification
- Location information (hashed)

**What's Public:**
- Number of registered artifacts (count only)
- Existence of transactions
- Access grant/revoke events (without revealing data)
- Smart contract interactions

---

## ✨ Features

### Core Features

- 🔐 **Encrypted Artifact Data** - All sensitive data encrypted using Zama FHEVM
- 🔑 **Selective Decryption** - Grant/revoke access to specific users on demand
- 👥 **Role-Based Access Control** - Owner, Admin, Curator, Auditor roles
- 📜 **Immutable Audit Trail** - Complete on-chain history of all events
- 🔄 **Secure Ownership Transfer** - Encrypted data preserved during transfers
- ✅ **Authenticity Verification** - Expert-driven validation with encrypted results
- 🚫 **Emergency Controls** - Deactivate/reactivate artifacts when needed
- 🔍 **Privacy-Preserving Queries** - Search without revealing sensitive data

### Advanced Privacy Features

- **Client-Side Encryption**: Data encrypted before leaving the user's browser
- **End-to-End Encryption**: Data never exposed in plaintext on blockchain
- **User Decrypt (EIP-712)**: Maximum privacy with signature-based decryption
- **Public Decrypt**: Optional aggregate data decryption for statistics
- **Granular Permissions**: Fine-grained access control per artifact
- **Time-Based Access**: Optional time-locked decryption capabilities

### 🚀 New: Advanced Architecture Features

#### Gateway Callback Pattern
- **Asynchronous Decryption**: Off-chain Gateway service for secure FHE decryption
- **Callback Mechanism**: `user submits request → contract records → Gateway decrypts → callback completes transaction`
- **Cryptographic Verification**: `FHE.checkSignatures()` ensures data integrity and authenticity
- **Request Tracking**: Complete lifecycle management with unique request IDs

#### Refund & Timeout Protection
- **Refund Mechanism**: Handles decryption failures gracefully
  - Partial refund (50%) of registration fee if Gateway timeout occurs
  - Prevents permanent fund locking in edge cases
  - One-time refund protection prevents double-claiming
- **Timeout Protection**: 1-day timeout prevents indefinite pending states
  - Automatic detection of expired requests
  - User-initiated refund after timeout period
  - `getDecryptionStatus()` provides real-time monitoring

#### Innovative Privacy Solutions

1. **Division Protection with Random Multiplier**
   - Prevents information leakage in FHE division operations
   - Uses `randomMultiplier` to add privacy noise
   - Maintains calculation accuracy while protecting sensitive values

2. **Price Obfuscation Technique**
   - Adds controlled random noise to price data
   - Prevents exact value extraction from blockchain
   - Configurable noise range for flexibility

3. **Privacy-Preserving Computations**
   - Weighted average calculations on encrypted data
   - Percentage calculations without revealing values
   - Fuzzy comparison for range checks

#### Security Enhancements

- **Input Validation**: Comprehensive checks on all parameters
  - `validArtifactIndex` modifier prevents out-of-bounds access
  - `nonZeroAddress` modifier blocks zero-address attacks
  - Require statements validate all user inputs

- **Access Control**: Multi-layered permission system
  - Owner-level permissions for artifact management
  - Curator-level permissions for platform administration
  - Expert certification system for authenticity verification

- **Overflow Protection**: Solidity 0.8.24+ built-in safety
  - Automatic revert on arithmetic overflow/underflow
  - Safe fee calculations and refund processing

- **Audit Trail**: Complete event logging
  - `DecryptionRequested`, `DecryptionCompleted`, `DecryptionFailed`
  - `RefundIssued`, `PlatformFeesWithdrawn`
  - Full transparency for off-chain monitoring

#### Gas Optimization (HCU Management)

- **HCU-Aware Design**: Optimized for Homomorphic Compute Units
  - Right-sized encrypted types (`euint8` for small values, `euint64` for large)
  - Batch permission grants to reduce operations
  - Minimized FHE operations where possible

- **Cost-Effective Operations**:
  - Registration: ~500K gas (4 encryptions)
  - Grant Access: ~200K gas (4 permissions)
  - Verify Authenticity: ~150K gas (1 decryption request)
  - Refund Request: ~100K gas (no FHE operations)

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 8.0.0
MetaMask browser extension
Sepolia testnet ETH (from faucets)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/ErikaHegmann/CulturalHeritageProtectionFHE.git
cd CulturalHeritageProtection

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your contract address and RPC URL

# Start development server
npm run dev
```

### Environment Configuration

```env
# Required
CONTRACT_ADDRESS=0xYourContractAddress
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Optional
NEXT_PUBLIC_CHAIN_ID=11155111
DEBUG=false
```

### Quick Test

```bash
# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Running Quality Testing Application

The repository includes an additional example application demonstrating FHE in manufacturing quality control:

```bash
# Navigate to quality testing app
cd quality-testing-app

# Install dependencies
npm install

# Start development server (runs on port 3003)
npm run dev

# Build for production
npm run build
```

The quality testing application demonstrates:
- React 18 + Vite + TypeScript stack
- @fhevm/sdk integration with React hooks
- Encrypted quality scores, defect counts, and batch numbers
- Inspector authorization and role-based access control
- Real-time blockchain verification

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  Next.js 14 + React 18 + TypeScript + Tailwind CSS        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  FHE Client Layer                           │
│  - Client-side encryption/decryption                        │
│  - FHEVM instance management                                │
│  - EIP-712 signature handling                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  Smart Contract Layer                       │
│  - CulturalHeritageProtection.sol (Main Contract)          │
│  - PrivacyUtils.sol (Utility Library)                       │
│  - Encrypted data storage on-chain                          │
│  - Access control & Gateway callbacks                       │
│  - Refund & timeout protection                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  FHE Infrastructure                         │
│  - Zama FHE Coprocessor (off-chain computation)            │
│  - Gateway Service (async decryption with callbacks)        │
│  - ACL Contract (access control list)                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Artifact Registration:**
```
1. User enters artifact data (plaintext)
2. Client encrypts data using FHE public key
3. Transaction submitted with registration fee (0.01 ETH)
4. Encrypted data stored on-chain
5. Event emitted (encrypted)
```

**Gateway Callback Pattern (Async Decryption):**
```
1. User requests decryption (e.g., verifyAuthenticity)
2. Contract calls FHE.requestDecryption() with callback selector
3. Decryption request stored with timeout timestamp
4. Gateway service monitors blockchain for requests
5. Gateway performs off-chain decryption
6. Gateway calls back contract with decrypted data + proof
7. Contract verifies proof via FHE.checkSignatures()
8. Contract processes result and updates state
9. Event emitted with results

TIMEOUT PATH (if Gateway fails):
  → User waits for DECRYPTION_TIMEOUT (1 day)
  → User calls requestDecryptionRefund()
  → Contract issues partial refund (50% of fee)
  → Prevents permanent fund locking
```

**Artifact Viewing (Authorized):**
```
1. User requests artifact data
2. Smart contract checks access permissions via modifiers
3. If authorized, returns encrypted data
4. User signs EIP-712 decryption request
5. Gateway verifies signature and permissions
6. Gateway decrypts and returns plaintext
7. Display to user
```

### Advanced Features Documentation

- **[Advanced Architecture](./docs/ADVANCED_ARCHITECTURE.md)** - Gateway callbacks, refund mechanism, timeout protection
- **[Privacy Utils Library](./contracts/PrivacyUtils.sol)** - Division protection, price obfuscation, privacy-preserving operations
- **[API Reference](./docs/API_REFERENCE.md)** - Complete function specifications

---

## 🔐 FHE Privacy Model

### Encrypted Data Types

| Data Field | FHE Type | Range | Privacy Level |
|------------|----------|-------|---------------|
| Artifact ID | `euint32` | 0 to 4.2B | **Private** |
| Category | `euint8` | 0 to 255 | **Private** |
| Age (years) | `euint32` | 0 to 4.2B | **Private** |
| Condition | `euint8` | 1 to 10 | **Private** |
| Value | `euint32` | 0 to 4.2B | **Private** |
| Owner | `eaddress` | Ethereum address | **Private** |
| Authenticity | `ebool` | true/false | **Private** |
| Location Hash | `euint32` | Hash value | **Private** |

### Privacy Guarantees

✅ **What FHE Protects:**
- All artifact metadata values
- Computation results
- Intermediate calculations
- Private contract storage
- Conditional logic outcomes

⚠️ **What FHE Does NOT Protect:**
- Transaction existence (public on blockchain)
- Smart contract function calls (public)
- Sender addresses (unless using eaddress)
- Transaction timing and order
- Gas usage patterns

### Access Control Matrix

| Role | Register | View Own | View Others | Grant Access | Update | Transfer |
|------|----------|----------|-------------|--------------|--------|----------|
| **Owner** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Curator** | ✅ | ✅ | ✅* | ❌ | ✅* | ❌ |
| **Auditor** | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ |
| **Public** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

*Only with granted access

For more details, see [FHE Concepts Documentation](./docs/FHE_CONCEPTS.md).

---

## 🛠 Tech Stack

### Frontend Implementations

#### Cultural Heritage Protection (Main Application)
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Webpack/Turbopack

#### Privacy Quality Inspection System
- **Framework**: React 18 (Standalone)
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **SDK Integration**: @fhevm/sdk (Universal FHEVM SDK)
- **Styling**: Custom CSS with responsive design
- **State Management**: React Hooks (useState, useEffect)
- **Components**: Modular React components with TypeScript

### Blockchain
- **Smart Contracts**: Solidity 0.8.24
- **FHE Library**: Zama TFHE (fhevm-core)
- **Network**: Ethereum Sepolia Testnet
- **Wallet Integration**: ethers.js v6
- **Development**: Hardhat

### FHE Infrastructure
- **Encryption**: Zama fhevmjs (client-side)
- **SDK**: @fhevm/sdk (Universal FHEVM SDK with React hooks)
- **Coprocessor**: Zama FHE Coprocessor
- **Gateway**: Zama Gateway Service
- **ACL**: Access Control List Contract

### Development Tools
- **Testing**: Hardhat, Chai, Mocha
- **Linting**: ESLint, Solhint
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend), Hardhat (contracts)

---

## 📘 Usage Guide

### 1. Connect Wallet

```typescript
// Connect MetaMask
await window.ethereum.request({ method: 'eth_requestAccounts' });

// Switch to Sepolia network
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }] // Sepolia
});
```

### 2. Register Artifact

```typescript
import { createFhevmInstance, encrypt } from '@fhevm/sdk';

// Initialize FHE
const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: CONTRACT_ADDRESS
});

// Encrypt artifact data
const encryptedId = await encrypt(fhevm, 12345, 'euint32');
const encryptedCategory = await encrypt(fhevm, 3, 'euint8');
const encryptedAge = await encrypt(fhevm, 500, 'euint32');
const encryptedCondition = await encrypt(fhevm, 8, 'euint8');
const encryptedValue = await encrypt(fhevm, 1000000, 'euint32');
const encryptedLocation = await encrypt(fhevm, locationHash, 'euint32');

// Submit to contract
const tx = await contract.registerArtifact(
  encryptedId,
  inputProof,
  encryptedCategory,
  encryptedAge,
  encryptedCondition,
  encryptedValue,
  encryptedLocation
);

await tx.wait();
console.log('Artifact registered!');
```

### 3. Grant Access

```typescript
// Grant decryption access to another user
const tx = await contract.grantAccess(
  registryId,
  curatorAddress
);

await tx.wait();
console.log('Access granted!');
```

### 4. View Artifact (Authorized)

```typescript
import { userDecrypt } from '@fhevm/sdk';

// Get encrypted data
const artifact = await contract.getEncryptedArtifact(registryId);

// Decrypt with signature
const decryptedId = await userDecrypt(fhevm, {
  ciphertext: artifact.artifactId,
  contractAddress: CONTRACT_ADDRESS,
  userAddress: userAddress,
  signer: signer
});

console.log('Artifact ID:', decryptedId);
```

### 5. Transfer Ownership

```typescript
// Transfer artifact to new owner
const tx = await contract.transferOwnership(
  registryId,
  newOwnerAddress
);

await tx.wait();
console.log('Ownership transferred!');
```

For complete API documentation, see [API Reference](./docs/API_REFERENCE.md).

---

## 🔧 Development

### Project Structure

```
D:\
├── app/                    # Next.js app directory (Cultural Heritage)
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ArtifactList.tsx
│   ├── EncryptionPanel.tsx
│   └── DecryptionPanel.tsx
├── contracts/             # Smart contracts
│   ├── CulturalHeritageProtection.sol
│   └── PrivacyQualityInspection.sol
├── quality-testing-app/   # Privacy Quality Inspection System
│   ├── src/
│   │   ├── components/
│   │   │   ├── InspectorAuthorization.tsx
│   │   │   ├── QualityInspection.tsx
│   │   │   └── InspectionVerification.tsx
│   │   ├── App.tsx        # Main React app
│   │   ├── main.tsx       # Entry point
│   │   └── styles.css     # Custom styling
│   ├── package.json       # Dependencies (React + Vite + @fhevm/sdk)
│   ├── vite.config.ts     # Vite configuration
│   └── README.md          # Quality testing documentation
├── fhevm-react-template/  # Universal FHEVM SDK repository
│   ├── packages/
│   │   └── fhevm-sdk/     # @fhevm/sdk package
│   └── examples/          # Additional FHE examples
├── scripts/               # Deployment scripts
│   └── deploy.js
├── test/                  # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                  # Documentation
│   ├── FHE_CONCEPTS.md
│   ├── ARCHITECTURE.md
│   └── API_REFERENCE.md
└── tasks/                 # Task management
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Deployment

```bash
# Deploy contracts to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy frontend to Vercel
vercel deploy --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Smart contract functions, FHE operations
- **Integration Tests**: Frontend + blockchain interactions
- **E2E Tests**: Complete user workflows
- **Security Tests**: Access control, encryption validation
- **Performance Tests**: Gas optimization, load testing

### Running Tests

```bash
# All tests
npm test

# Specific test suite
npm test -- test/unit/

# Watch mode
npm run test:watch

# Coverage report
npm run coverage
```

Current test coverage: **80%+**

For testing checklist, see [TESTING_CHECKLIST.md](./tasks/TESTING_CHECKLIST.md).

---

## 🔒 Security

### Security Features

- **Client-Side Encryption**: Data never exposed in plaintext
- **EIP-712 Signatures**: Secure decryption authorization
- **Access Control**: Role-based permissions
- **Audit Trail**: Immutable event logs
- **Input Validation**: Comprehensive validation
- **Rate Limiting**: Protection against abuse

### Security Best Practices

1. **Never expose private keys**
2. **Always validate user input**
3. **Use hardware wallets for production**
4. **Regularly audit smart contracts**
5. **Monitor for suspicious activity**
6. **Keep dependencies updated**

For security details, see [SECURITY_AND_PERFORMANCE.md](./SECURITY_AND_PERFORMANCE.md).

---

## 📚 API Reference

### Smart Contract Functions

#### Core Functions
- `registerArtifact(uint32 _id, uint64 _value, uint32 _age, bool _isAuthentic, string _category)` - Register new artifact with encrypted data (requires 0.01 ETH fee)
- `transferOwnership(uint32 _artifactIndex, address _newOwner)` - Transfer artifact to new owner
- `grantAccess(uint32 _artifactIndex, address _viewer, string _purpose)` - Grant decryption access with audit trail
- `revokeAccess(uint32 _artifactIndex, address _viewer)` - Revoke access permissions
- `getArtifactInfo(uint32 _artifactIndex)` - Retrieve public artifact information

#### Gateway Callback Functions (New)
- `verifyAuthenticity(uint32 _artifactIndex)` - Request async decryption via Gateway (expert only)
- `processAuthenticityResult(uint256 requestId, bytes cleartexts, bytes decryptionProof)` - Gateway callback handler
- `requestDecryptionRefund(uint256 requestId)` - Request refund for timed-out decryption
- `getDecryptionStatus(uint256 requestId)` - Check request status (processed, refunded, timed out)

#### Admin Functions
- `certifyExpert(address _expert, bool _certified)` - Certify/revoke expert status (curator only)
- `withdrawPlatformFees(address payable to)` - Withdraw accumulated fees (curator only)
- `getPlatformFees()` - View platform fee balance

#### Artifact Management
- `deactivateArtifact(uint32 _artifactIndex)` - Soft delete artifact
- `reactivateArtifact(uint32 _artifactIndex)` - Reactivate deactivated artifact
- `isAuthorizedViewer(uint32 _artifactIndex, address _viewer)` - Check authorization status
- `getAccessHistory(uint32 _artifactIndex)` - Retrieve complete access audit trail

### Privacy Utils Library Functions

- `safeDivide(euint64 numerator, euint64 denominator, uint64 randomMultiplier)` - Privacy-preserving division
- `obfuscatePrice(euint64 price, uint32 noiseRange, uint256 noiseSeed)` - Add privacy noise to prices
- `calculatePercentage(euint64 value, uint32 percentage)` - Encrypted percentage calculation
- `weightedAverage(euint64 value1, uint32 weight1, euint64 value2, uint32 weight2)` - Encrypted weighted average
- `generateRandomMultiplier(uint256 seed, uint64 min, uint64 max)` - Generate random multiplier for privacy
- `clampValue(euint64 value, uint64 minValue, uint64 maxValue)` - Privacy-preserving value clamping
- `updateEMA(euint64 currentEMA, euint64 newValue, uint32 alpha)` - Exponential moving average on encrypted data

### Frontend Hooks

- `useFhevm()` - FHEVM instance management
- `useEncrypt()` - Encryption operations
- `useDecrypt()` - Decryption operations
- `useContract()` - Contract interactions

For complete API documentation, see [API_REFERENCE.md](./docs/API_REFERENCE.md).

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Live Application**: https://cultural-heritage-protection-fhe.vercel.app/
- **GitHub Repository**: https://github.com/ErikaHegmann/CulturalHeritageProtectionFHE
- **Demo Video**: `demo.mp4` (Download from repository to watch)
- **Documentation**: [./docs](./docs/)
- **Zama FHEVM**: https://docs.zama.ai/fhevm

---

## 📞 Support

For questions or issues:

- **GitHub Issues**: [Create an issue](https://github.com/ErikaHegmann/CulturalHeritageProtectionFHE/issues)
- **Documentation**: [Browse docs](./docs/)
- **Zama Discord**: [Join community](https://discord.gg/zama)

---

## 🎯 Key Innovations Summary

This implementation showcases cutting-edge FHE technology with production-ready features:

### Architecture Innovations
✅ **Gateway Callback Pattern** - Asynchronous decryption with cryptographic verification
✅ **Refund Mechanism** - Handles decryption failures gracefully, prevents fund locking
✅ **Timeout Protection** - 1-day timeout with automatic recovery mechanism

### Privacy Innovations
✅ **Division Protection** - Random multiplier technique prevents information leakage
✅ **Price Obfuscation** - Controlled noise addition protects sensitive valuations
✅ **Privacy-Preserving Computations** - Weighted averages, percentages, and fuzzy comparisons on encrypted data

### Security Features
✅ **Input Validation** - Comprehensive parameter checking with custom modifiers
✅ **Access Control** - Multi-layered permission system (Owner, Curator, Expert roles)
✅ **Overflow Protection** - Solidity 0.8.24+ automatic safety
✅ **Audit Trail** - Complete event logging for transparency and compliance

### Gas Optimization
✅ **HCU-Aware Design** - Right-sized encrypted types and batched operations
✅ **Cost-Effective** - Registration ~500K gas, Access grants ~200K gas
✅ **Minimized FHE Operations** - Strategic use of encryption where needed

### Smart Contract Structure
```
contracts/
├── CulturalHeritageProtection.sol  (537 lines, main contract)
└── PrivacyUtils.sol                (280+ lines, utility library)
```

### Documentation
- **[Advanced Architecture](./docs/ADVANCED_ARCHITECTURE.md)** - Deep dive into Gateway callbacks and privacy techniques
- **[API Reference](./docs/API_REFERENCE.md)** - Complete function specifications
- **[Security Audit](./SECURITY_AND_PERFORMANCE.md)** - Security analysis and best practices

---

**Built with ❤️ using Zama FHEVM technology for privacy-preserving cultural heritage protection.**

**Key Technologies**: Solidity 0.8.24 • Zama FHEVM • Gateway Callback Pattern • Privacy-Preserving Operations • Production-Ready Security
