# Advanced FHE Architecture Documentation

## Overview

This document describes the advanced privacy-preserving features implemented in the Cultural Heritage Protection platform, including Gateway callback pattern, refund mechanisms, timeout protection, and innovative privacy solutions.

## Table of Contents

1. [Gateway Callback Pattern](#gateway-callback-pattern)
2. [Refund Mechanism](#refund-mechanism)
3. [Timeout Protection](#timeout-protection)
4. [Privacy-Preserving Operations](#privacy-preserving-operations)
5. [Security Enhancements](#security-enhancements)
6. [Gas Optimization](#gas-optimization)

---

## Gateway Callback Pattern

### Architecture

The Gateway callback pattern provides asynchronous decryption of FHE-encrypted data through a secure, off-chain Gateway service.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Flow                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  1. User Request: verifyAuthenticity(artifactIndex)         │
│     - Initiates decryption request                          │
│     - Creates DecryptionRequest struct                      │
│     - Sets timeout timestamp                                │
└────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Smart Contract: FHE.requestDecryption()                 │
│     - Converts encrypted data to bytes32[]                  │
│     - Specifies callback function selector                  │
│     - Returns unique requestId                              │
│     - Emits DecryptionRequested event                       │
└────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Gateway Service (Off-chain)                             │
│     - Monitors DecryptionRequested events                   │
│     - Performs secure decryption                            │
│     - Generates cryptographic proof                         │
│     - Prepares callback transaction                         │
└────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Callback: processAuthenticityResult()                   │
│     - FHE.checkSignatures() validates proof                 │
│     - Decode cleartexts                                     │
│     - Update contract state                                 │
│     - Emit DecryptionCompleted event                        │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### Step 1: Request Decryption

```solidity
function verifyAuthenticity(uint32 _artifactIndex) external onlyExpert {
    HeritageArtifact storage artifact = artifacts[_artifactIndex];
    require(!artifact.isDecryptionPending, "Decryption already pending");

    // Prepare ciphertexts for decryption
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(artifact.isAuthentic);

    // Request Gateway decryption with callback
    uint256 requestId = FHE.requestDecryption(
        cts,
        this.processAuthenticityResult.selector
    );

    // Track request state
    artifact.decryptionRequestId = requestId;
    artifact.isDecryptionPending = true;
    artifact.decryptionRequestTime = block.timestamp;

    emit DecryptionRequested(_artifactIndex, requestId, msg.sender);
}
```

#### Step 2: Gateway Callback

```solidity
function processAuthenticityResult(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Cryptographic verification
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Retrieve request context
    DecryptionRequest storage request = decryptionRequests[requestId];
    require(!request.isProcessed, "Request already processed");

    // Decode decrypted data
    bool authentic = abi.decode(cleartexts, (bool));

    // Update state
    artifact.isDecryptionPending = false;
    request.isProcessed = true;

    emit AuthenticityVerified(artifactIndex, authentic);
}
```

### Security Features

1. **Signature Verification**: `FHE.checkSignatures()` ensures data integrity
2. **Request Tracking**: Prevents replay attacks via `isProcessed` flag
3. **State Management**: `isDecryptionPending` prevents concurrent requests
4. **Event Logging**: Complete audit trail of decryption requests

---

## Refund Mechanism

### Problem Statement

When Gateway decryption fails or times out, users' registration fees could be permanently locked in the contract. The refund mechanism solves this by:

1. Detecting timeout conditions
2. Allowing users to reclaim locked funds
3. Preventing double-refund attacks

### Implementation

```solidity
function requestDecryptionRefund(uint256 requestId) external {
    DecryptionRequest storage request = decryptionRequests[requestId];

    // Validation checks
    require(request.requester != address(0), "Request does not exist");
    require(msg.sender == request.requester, "Not the requester");
    require(!request.isProcessed, "Request already processed");
    require(!request.isRefunded, "Refund already issued");

    // Timeout check
    require(
        block.timestamp >= request.timestamp + DECRYPTION_TIMEOUT,
        "Timeout period not elapsed"
    );

    // Issue partial refund (50% of registration fee)
    uint256 refundAmount = artifact.registrationFee / 2;
    artifact.registrationFee -= refundAmount;

    (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
    require(sent, "Refund transfer failed");

    emit RefundIssued(artifactIndex, msg.sender, refundAmount);
}
```

### Refund Policy

- **Timeout Period**: 1 day (configurable via `DECRYPTION_TIMEOUT`)
- **Refund Amount**: 50% of registration fee (partial refund)
- **Eligibility**: Only original requester can claim refund
- **One-time Only**: `isRefunded` flag prevents multiple claims

### State Transitions

```
Registration → Decryption Request → [Success Path or Timeout Path]

Success Path:
  Request → Gateway Processing → Callback → State Updated

Timeout Path:
  Request → Timeout Expires → User Claims Refund → Funds Returned
```

---

## Timeout Protection

### Purpose

Prevents permanent fund locking and ensures system liveness even if Gateway service experiences issues.

### Configuration

```solidity
uint256 public constant DECRYPTION_TIMEOUT = 1 days;
```

### Timeout Detection

```solidity
function getDecryptionStatus(uint256 requestId)
    external view returns (
        uint32 artifactIndex,
        address requester,
        uint256 timestamp,
        bool isProcessed,
        bool isRefunded,
        bool isTimedOut
    )
{
    DecryptionRequest storage request = decryptionRequests[requestId];
    bool timedOut = block.timestamp >= request.timestamp + DECRYPTION_TIMEOUT;

    return (
        request.artifactIndex,
        request.requester,
        request.timestamp,
        request.isProcessed,
        request.isRefunded,
        timedOut
    );
}
```

### Best Practices

1. **Monitor Timeouts**: Frontend should track pending requests
2. **Alert Users**: Notify when approaching timeout threshold
3. **Automatic Retry**: Consider retry logic before timeout
4. **Gateway Health**: Monitor Gateway service availability

---

## Privacy-Preserving Operations

### 1. Division Protection Using Random Multiplier

**Problem**: Direct division on encrypted values can leak information about operand magnitudes.

**Solution**: Multiply both numerator and denominator by a random factor.

```solidity
function safeDivide(
    euint64 numerator,
    euint64 denominator,
    uint64 randomMultiplier
) internal returns (euint64 result) {
    require(randomMultiplier > 0, "Random multiplier must be positive");

    euint64 encryptedMultiplier = FHE.asEuint64(randomMultiplier);

    // Scale both values
    euint64 scaledNumerator = FHE.mul(numerator, encryptedMultiplier);
    euint64 scaledDenominator = FHE.mul(denominator, encryptedMultiplier);

    // Perform division on scaled values
    result = FHE.div(scaledNumerator, scaledDenominator);

    return result;
}
```

**Benefits**:
- Preserves ratio accuracy
- Adds privacy noise to prevent value leakage
- Protects against side-channel attacks

### 2. Price Obfuscation Technique

**Problem**: Price values can be sensitive and reveal market information.

**Solution**: Add controlled random noise to prices.

```solidity
function obfuscatePrice(
    euint64 price,
    uint32 noiseRange,
    uint256 noiseSeed
) internal returns (euint64 obfuscatedPrice) {
    // Generate pseudo-random noise
    uint64 noise = uint64(
        uint256(keccak256(abi.encodePacked(noiseSeed, block.timestamp)))
        % noiseRange
    );

    euint64 encryptedNoise = FHE.asEuint64(noise);
    obfuscatedPrice = FHE.add(price, encryptedNoise);

    return obfuscatedPrice;
}
```

**Use Cases**:
- Private auctions
- Confidential valuations
- Market-sensitive transactions

### 3. Privacy-Preserving Percentage Calculations

```solidity
function calculatePercentage(
    euint64 value,
    uint32 percentage
) internal returns (euint64 result) {
    require(percentage <= 10000, "Percentage must be <= 10000 basis points");

    euint64 percentageEncrypted = FHE.asEuint64(uint64(percentage));
    euint64 multiplied = FHE.mul(value, percentageEncrypted);
    euint64 divisor = FHE.asEuint64(10000);

    result = FHE.div(multiplied, divisor);

    return result;
}
```

### 4. Weighted Average Computation

```solidity
function weightedAverage(
    euint64 value1,
    uint32 weight1,
    euint64 value2,
    uint32 weight2
) internal returns (euint64 average) {
    require(weight1 + weight2 == 100, "Weights must sum to 100");

    euint64 w1 = FHE.asEuint64(uint64(weight1));
    euint64 w2 = FHE.asEuint64(uint64(weight2));

    euint64 component1 = FHE.mul(value1, w1);
    euint64 component2 = FHE.mul(value2, w2);

    euint64 sum = FHE.add(component1, component2);
    euint64 divisor = FHE.asEuint64(100);

    average = FHE.div(sum, divisor);

    return average;
}
```

---

## Security Enhancements

### Input Validation

All functions implement comprehensive input validation:

```solidity
modifier validArtifactIndex(uint32 _artifactIndex) {
    require(_artifactIndex < totalArtifacts, "Artifact does not exist");
    _;
}

modifier nonZeroAddress(address _address) {
    require(_address != address(0), "Invalid address: zero address");
    _;
}
```

### Access Control

Multi-layered access control system:

```solidity
modifier onlyCurator() {
    require(msg.sender == curator, "Not authorized curator");
    _;
}

modifier onlyAuthorized(uint32 _artifactIndex) {
    require(
        msg.sender == artifacts[_artifactIndex].owner ||
        authorizedViewers[_artifactIndex][msg.sender] ||
        certifiedExperts[msg.sender],
        "Not authorized to view artifact"
    );
    _;
}

modifier onlyExpert() {
    require(certifiedExperts[msg.sender], "Not a certified expert");
    _;
}
```

### Overflow Protection

Solidity 0.8.24+ provides built-in overflow/underflow protection:

```solidity
// Safe arithmetic operations
artifact.registrationFee -= refundAmount;  // Reverts on underflow
platformFees += msg.value;                 // Reverts on overflow
```

### Reentrancy Protection

Using checks-effects-interactions pattern:

```solidity
function requestDecryptionRefund(uint256 requestId) external {
    // Checks
    require(!request.isRefunded, "Refund already issued");

    // Effects (state changes before external calls)
    request.isRefunded = true;
    artifact.registrationFee -= refundAmount;

    // Interactions (external calls last)
    (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
    require(sent, "Refund transfer failed");
}
```

### Audit Trail

Comprehensive event logging for all critical operations:

```solidity
event DecryptionRequested(uint32 indexed artifactIndex, uint256 requestId, address requester);
event DecryptionCompleted(uint32 indexed artifactIndex, uint256 requestId);
event DecryptionFailed(uint32 indexed artifactIndex, uint256 requestId, string reason);
event RefundIssued(uint32 indexed artifactIndex, address indexed user, uint256 amount);
```

---

## Gas Optimization

### HCU (Homomorphic Compute Units) Management

FHE operations consume HCU, the computational cost of homomorphic operations:

#### Operation Costs

| Operation | HCU Cost | Notes |
|-----------|----------|-------|
| `FHE.asEuint32()` | Low | Encryption |
| `FHE.asEuint64()` | Low | Encryption |
| `FHE.add()` | Medium | Addition |
| `FHE.mul()` | High | Multiplication |
| `FHE.div()` | Very High | Division (use sparingly) |
| `FHE.lt/gt/eq()` | Medium | Comparisons |
| `FHE.select()` | Medium | Conditional selection |

#### Optimization Strategies

1. **Batch Operations**
```solidity
// ❌ Bad: Multiple separate operations
FHE.allow(artifact.encryptedId, _viewer);
FHE.allow(artifact.encryptedValue, _viewer);
FHE.allow(artifact.encryptedAge, _viewer);

// ✅ Better: Batch permissions in single transaction
// (Already optimized in grantAccess function)
```

2. **Reuse Encrypted Values**
```solidity
// ❌ Bad: Repeated encryption
euint64 zero = FHE.asEuint64(0);
euint64 zero2 = FHE.asEuint64(0);

// ✅ Better: Reuse encrypted constant
euint64 zero = FHE.asEuint64(0);
```

3. **Minimize FHE Operations**
```solidity
// Store registration fee as plaintext when possible
registrationFee: REGISTRATION_FEE  // Plaintext storage
```

4. **Use Appropriate Data Types**
```solidity
// ❌ Bad: Oversized type
euint64 categoryId;  // For values 0-10

// ✅ Better: Right-sized type
euint8 categoryId;   // Saves HCU
```

### Gas Cost Estimates

| Function | Gas Cost | HCU Usage |
|----------|----------|-----------|
| `registerArtifact()` | ~500K | High (4 encryptions) |
| `grantAccess()` | ~200K | Medium (4 allows) |
| `verifyAuthenticity()` | ~150K | Low (1 request) |
| `requestDecryptionRefund()` | ~100K | None |
| `getArtifactInfo()` | ~50K | None (view) |

---

## Summary

This advanced architecture provides:

✅ **Asynchronous Decryption**: Gateway callback pattern for secure off-chain computation
✅ **Fund Safety**: Refund mechanism prevents permanent fund locking
✅ **Timeout Protection**: Automatic recovery from Gateway failures
✅ **Privacy Innovation**: Division protection and price obfuscation
✅ **Security Best Practices**: Input validation, access control, audit trails
✅ **Gas Efficiency**: Optimized HCU usage for cost-effective FHE operations

## Next Steps

1. Review [API_REFERENCE.md](./API_REFERENCE.md) for function specifications
2. Study [SECURITY.md](./SECURITY.md) for security audit results
3. Check [GAS_OPTIMIZATION.md](./GAS_OPTIMIZATION.md) for performance tuning

---

**Built with cutting-edge FHE technology for privacy-preserving cultural heritage protection.**
