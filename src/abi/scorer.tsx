const SCORER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    name: 'getScore',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' }
    ],
    name: 'getScores',
    outputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

export default SCORER_ABI
