const REGISTRY_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'credentialGroupId', type: 'uint256' },
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
        ],
        internalType: 'struct ICredentialRegistry.CredentialGroupProof',
        name: 'proof_',
        type: 'tuple'
      }
    ],
    name: 'verifyProof',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
]

export default REGISTRY_ABI
