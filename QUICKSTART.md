# Quick Start Guide

## Cultural Heritage Protection - Hardhat Development Framework

This guide provides a quick reference for getting started with the Cultural Heritage Protection smart contract project.

---

## Prerequisites Checklist

- [ ] Node.js v18.0.0+ installed
- [ ] npm v8.0.0+ installed
- [ ] MetaMask wallet configured
- [ ] Sepolia testnet ETH (0.05+ ETH recommended)
- [ ] Infura or Alchemy account for RPC
- [ ] Etherscan API key

---

## Installation (5 minutes)

### 1. Install Dependencies

```bash
cd /path/to/cultural-heritage-protection
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Compile Contracts

```bash
npm run compile
```

---

## Deployment (2 minutes)

### Deploy to Sepolia

```bash
npm run deploy
```

**Expected output:**
```
✅ Contract deployed to: 0x...
🔗 Etherscan: https://sepolia.etherscan.io/address/0x...
```

### Verify on Etherscan

```bash
npm run verify
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts |
| `npm test` | Run tests |
| `npm run deploy` | Deploy to Sepolia |
| `npm run verify` | Verify on Etherscan |
| `npm run interact` | Interactive CLI |
| `npm run simulate` | Run simulation |
| `npm run node` | Start local node |
| `npm run clean` | Clean build files |

---

## Quick Test Workflow

### 1. Deploy Locally

```bash
# Terminal 1
npm run node

# Terminal 2
npm run deploy:local
```

### 2. Run Simulation

```bash
npm run simulate
```

### 3. Interactive Testing

```bash
npm run interact
```

---

## Contract Functions Quick Reference

### Register Artifact
```javascript
await contract.registerArtifact(1001, 500000, 2500, true, "Ancient Pottery");
```

### Grant Access
```javascript
await contract.grantAccess(0, viewerAddress, "Research purpose");
```

### Revoke Access
```javascript
await contract.revokeAccess(0, viewerAddress);
```

### Certify Expert (Curator only)
```javascript
await contract.certifyExpert(expertAddress, true);
```

### View Artifact Info
```javascript
const info = await contract.getArtifactInfo(0);
```

### Check Authorization
```javascript
const authorized = await contract.isAuthorizedViewer(0, address);
```

---

## Project Structure

```
cultural-heritage-protection/
├── contracts/              # Solidity contracts
│   └── CulturalHeritageProtection.sol
├── scripts/                # Deployment & interaction scripts
│   ├── deploy.js          # Main deployment
│   ├── verify.js          # Etherscan verification
│   ├── interact.js        # Interactive CLI
│   └── simulate.js        # Simulation tests
├── test/                   # Test files
├── deployments/            # Deployment records (auto-generated)
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Dependencies
├── .env                    # Environment variables (don't commit!)
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md               # Full documentation
```

---

## Common Issues & Solutions

### Issue: Deployment fails with "insufficient funds"
**Solution:** Add Sepolia ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Issue: Verification fails
**Solution:**
1. Wait 1-2 minutes after deployment
2. Check ETHERSCAN_API_KEY in `.env`
3. Try manual verification on Etherscan

### Issue: RPC connection error
**Solution:**
1. Verify RPC URL in `.env`
2. Check Infura/Alchemy API key validity
3. Try alternative RPC endpoint

---

## Network Information

### Sepolia Testnet

- **Chain ID:** 11155111
- **Explorer:** https://sepolia.etherscan.io/
- **RPC:** https://sepolia.infura.io/v3/YOUR_KEY
- **Faucets:** https://sepoliafaucet.com/

---

## Security Reminders

- ⚠️ Never commit `.env` file
- ⚠️ Keep private keys secure
- ⚠️ Test on Sepolia before mainnet
- ⚠️ Use hardware wallet for production
- ⚠️ Audit access permissions regularly

---

## Next Steps

1. ✅ Deploy contract to Sepolia
2. ✅ Verify on Etherscan
3. ✅ Run simulation tests
4. ✅ Test interactive CLI
5. 📝 Write additional tests
6. 🔒 Security audit (before mainnet)
7. 🚀 Mainnet deployment (when ready)

---

## Getting Help

- 📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- 📖 See [README.md](./README.md) for full documentation
- 🔗 Hardhat Docs: https://hardhat.org/docs
- 🔗 fhEVM Docs: https://docs.zama.ai/fhevm

---

**Quick Reference Card**

```bash
# Setup
npm install && cp .env.example .env

# Deploy
npm run compile && npm run deploy

# Verify
npm run verify

# Test
npm run simulate

# Interact
npm run interact
```

---

**Version:** 1.0.0
**Framework:** Hardhat
**Network:** Sepolia Testnet
**Contract:** CulturalHeritageProtection
