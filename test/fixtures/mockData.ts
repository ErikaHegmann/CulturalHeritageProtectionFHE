/**
 * Test Fixtures and Mock Data
 *
 * Provides mock data for testing FHEVM SDK functionality
 */

export const mockAddresses = {
  contract: '0x1234567890abcdef1234567890abcdef12345678',
  user1: '0xabcdef1234567890abcdef1234567890abcdef12',
  user2: '0x9876543210fedcba9876543210fedcba98765432',
  deployer: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
};

export const mockNetworkConfig = {
  sepolia: {
    name: 'sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/test-key',
    gatewayUrl: 'https://gateway.sepolia.zama.ai',
    aclAddress: '0xACL123...'
  },
  localhost: {
    name: 'localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    gatewayUrl: 'http://localhost:8080',
    aclAddress: '0xACL456...'
  }
};

export const mockFhevmConfig = {
  network: 'localhost' as const,
  contractAddress: mockAddresses.contract,
  debug: true
};

export const mockPublicKey = '0x' + 'a'.repeat(128);

export const mockEncryptedData = {
  euint8: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
  euint16: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
  euint32: new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
  ]),
  ebool: new Uint8Array([1, 0, 1, 0])
};

export const mockDecryptedValues = {
  number: 42,
  boolean: true,
  bigNumber: BigInt('1000000000'),
  zero: 0,
  max8bit: 255,
  max16bit: 65535,
  max32bit: 4294967295
};

export const mockFhevmInstance = {
  config: mockFhevmConfig,
  instance: {
    getPublicKey: () => mockPublicKey,
    encrypt: (type: string, value: any) => {
      switch (type) {
        case 'euint8':
          return mockEncryptedData.euint8;
        case 'euint16':
          return mockEncryptedData.euint16;
        case 'euint32':
          return mockEncryptedData.euint32;
        case 'ebool':
          return mockEncryptedData.ebool;
        default:
          return mockEncryptedData.euint32;
      }
    },
    decrypt: () => Promise.resolve(mockDecryptedValues.number),
    createEIP712: () => ({
      domain: {
        name: 'FHE Decryption',
        version: '1',
        chainId: 31337,
        verifyingContract: mockAddresses.contract
      },
      types: {
        Decrypt: [
          { name: 'ciphertext', type: 'bytes' },
          { name: 'user', type: 'address' }
        ]
      },
      message: {
        ciphertext: '0x123...',
        user: mockAddresses.user1
      }
    })
  },
  publicKey: mockPublicKey,
  chainId: 31337,
  provider: null
};

export const mockSigner = {
  signTypedData: async (domain: any, types: any, message: any) => {
    return '0xmocksignature1234567890abcdef';
  },
  getAddress: async () => mockAddresses.user1
};

export const mockProvider = {
  getNetwork: async () => ({
    chainId: BigInt(31337),
    name: 'localhost'
  }),
  getSigner: () => mockSigner,
  getBlockNumber: async () => 12345,
  getBalance: async (address: string) => BigInt('1000000000000000000')
};

export const mockContract = {
  address: mockAddresses.contract,
  interface: {
    encodeFunctionData: (func: string, params: any[]) => '0xencodeddata',
    decodeFunctionResult: (func: string, data: any) => [mockDecryptedValues.number]
  },
  castVote: async (encryptedVote: Uint8Array) => ({
    hash: '0xtxhash123',
    wait: async () => ({
      status: 1,
      blockNumber: 12346,
      transactionHash: '0xtxhash123'
    })
  }),
  getResults: async () => mockEncryptedData.euint32,
  getEncryptedData: async (id: number) => mockEncryptedData.euint32
};

export const mockWallet = {
  address: mockAddresses.user1,
  isConnected: true,
  chainId: 31337,
  provider: mockProvider,
  signer: mockSigner
};

export const mockMetaMask = {
  isMetaMask: true,
  request: async ({ method, params }: any) => {
    switch (method) {
      case 'eth_requestAccounts':
        return [mockAddresses.user1];
      case 'eth_accounts':
        return [mockAddresses.user1];
      case 'eth_chainId':
        return '0x7a69'; // 31337 in hex
      case 'wallet_switchEthereumChain':
        return null;
      case 'wallet_addEthereumChain':
        return null;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  },
  on: (event: string, handler: Function) => {},
  removeListener: (event: string, handler: Function) => {}
};

export const mockErrors = {
  networkError: new Error('Network request failed'),
  invalidAddress: new Error('Invalid contract address'),
  userRejected: new Error('User rejected the request'),
  insufficientFunds: new Error('Insufficient funds for transaction'),
  contractError: new Error('Contract execution reverted'),
  encryptionError: new Error('Encryption failed'),
  decryptionError: new Error('Decryption failed')
};

export const mockVotingData = {
  options: [
    { id: 1, name: 'Option A', description: 'First option' },
    { id: 2, name: 'Option B', description: 'Second option' },
    { id: 3, name: 'Option C', description: 'Third option' }
  ],
  votes: {
    option1: 10,
    option2: 15,
    option3: 5
  },
  totalVotes: 30
};

export const mockCourtData = {
  investigation: {
    id: 1,
    caseId: mockEncryptedData.euint32,
    status: 'active',
    investigator: mockAddresses.user1
  },
  evidence: {
    id: 1,
    type: mockEncryptedData.euint8,
    confidentialityLevel: mockEncryptedData.euint32,
    submitter: mockAddresses.user1
  },
  witness: {
    id: 1,
    witnessId: mockEncryptedData.euint32,
    credibilityScore: mockEncryptedData.euint8,
    testimony: mockEncryptedData.euint32,
    isProtected: true
  },
  vote: {
    verdict: mockEncryptedData.euint8,
    confidence: mockEncryptedData.euint8,
    voter: mockAddresses.user2
  }
};

export const mockTestScenarios = {
  happyPath: {
    description: 'Successful encryption and decryption',
    input: 42,
    type: 'euint32',
    expectedOutput: 42
  },
  edgeCases: [
    {
      description: 'Zero value',
      input: 0,
      type: 'euint8',
      expectedOutput: 0
    },
    {
      description: 'Maximum euint8',
      input: 255,
      type: 'euint8',
      expectedOutput: 255
    },
    {
      description: 'Maximum euint16',
      input: 65535,
      type: 'euint16',
      expectedOutput: 65535
    },
    {
      description: 'Boolean true',
      input: true,
      type: 'ebool',
      expectedOutput: true
    },
    {
      description: 'Boolean false',
      input: false,
      type: 'ebool',
      expectedOutput: false
    }
  ],
  errorCases: [
    {
      description: 'Null FHEVM instance',
      input: null,
      expectedError: 'FHEVM instance not initialized'
    },
    {
      description: 'Invalid type',
      input: 42,
      type: 'invalid',
      expectedError: 'Invalid encryption type'
    },
    {
      description: 'Value overflow',
      input: 256,
      type: 'euint8',
      expectedError: 'Value exceeds type maximum'
    }
  ]
};

// Helper function to create mock FHEVM instance
export function createMockFhevmInstance(overrides = {}) {
  return {
    ...mockFhevmInstance,
    ...overrides
  };
}

// Helper function to create mock wallet
export function createMockWallet(overrides = {}) {
  return {
    ...mockWallet,
    ...overrides
  };
}

// Helper function to create mock contract
export function createMockContract(overrides = {}) {
  return {
    ...mockContract,
    ...overrides
  };
}
