const CREDENTIAL_GROUP_PROOF_COMPONENTS = [
  { internalType: 'uint256', name: 'credentialGroupId', type: 'uint256' },
  { internalType: 'uint256', name: 'appId', type: 'uint256' },
  {
    components: [
      { internalType: 'uint256', name: 'merkleTreeDepth', type: 'uint256' },
      { internalType: 'uint256', name: 'merkleTreeRoot', type: 'uint256' },
      { internalType: 'uint256', name: 'nullifier', type: 'uint256' },
      { internalType: 'uint256', name: 'message', type: 'uint256' },
      { internalType: 'uint256', name: 'scope', type: 'uint256' },
      { internalType: 'uint256[8]', name: 'points', type: 'uint256[8]' }
    ],
    internalType: 'struct ISemaphore.SemaphoreProof',
    name: 'semaphoreProof',
    type: 'tuple'
  }
]

const REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'context_', type: 'uint256' },
      {
        components: CREDENTIAL_GROUP_PROOF_COMPONENTS,
        internalType: 'struct ICredentialRegistry.CredentialGroupProof',
        name: 'proof_',
        type: 'tuple'
      }
    ],
    name: 'verifyProof',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'context_', type: 'uint256' },
      {
        components: CREDENTIAL_GROUP_PROOF_COMPONENTS,
        internalType: 'struct ICredentialRegistry.CredentialGroupProof[]',
        name: 'proofs_',
        type: 'tuple[]'
      }
    ],
    name: 'verifyProofs',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'context_', type: 'uint256' },
      {
        components: CREDENTIAL_GROUP_PROOF_COMPONENTS,
        internalType: 'struct ICredentialRegistry.CredentialGroupProof[]',
        name: 'proofs_',
        type: 'tuple[]'
      }
    ],
    name: 'getScore',
    outputs: [{ internalType: 'uint256', name: '_score', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'appId', type: 'uint256' }
    ],
    name: 'apps',
    outputs: [
      { internalType: 'enum ICredentialRegistry.AppStatus', name: 'status', type: 'uint8' },
      { internalType: 'uint256', name: 'recoveryTimelock', type: 'uint256' },
      { internalType: 'address', name: 'admin', type: 'address' },
      { internalType: 'address', name: 'scorer', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

export default REGISTRY_ABI
