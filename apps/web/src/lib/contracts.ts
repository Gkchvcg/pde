export const DATA_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "";

export const dataMarketplaceAbi = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createPermission",
    inputs: [
      { name: "category", type: "uint8" },
      { name: "pricePerAccess", type: "uint256" },
      { name: "allowFitness", type: "bool" },
      { name: "allowHealthcare", type: "bool" },
      { name: "allowMarketing", type: "bool" },
      { name: "allowInsurance", type: "bool" },
      { name: "durationSeconds", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getPermission",
    inputs: [
      { name: "user", type: "address" },
      { name: "category", type: "uint8" },
    ],
    outputs: [
      {
        components: [
          { name: "user", type: "address" },
          { name: "category", type: "uint8" },
          { name: "pricePerAccess", type: "uint256" },
          { name: "allowFitnessCompanies", type: "bool" },
          { name: "allowHealthcareCompanies", type: "bool" },
          { name: "allowMarketingCompanies", type: "bool" },
          { name: "allowInsuranceCompanies", type: "bool" },
          { name: "expiresAt", type: "uint256" },
          { name: "active", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createRequest",
    inputs: [
      { name: "dataOwner", type: "address" },
      { name: "category", type: "uint8" },
      { name: "offeredAmount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "approveRequest",
    inputs: [{ name: "requestId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "withdrawEarnings",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "fulfillRequest",
    inputs: [
      { name: "requestId", type: "bytes32" },
      { name: "insightCid", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getRequest",
    inputs: [{ name: "requestId", type: "bytes32" }],
    outputs: [
      {
        components: [
          { name: "requester", type: "address" },
          { name: "dataOwner", type: "address" },
          { name: "category", type: "uint8" },
          { name: "offeredAmount", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "insightCid", type: "string" },
        ],
        name: "",
        type: "tuple",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "userEarnings",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

